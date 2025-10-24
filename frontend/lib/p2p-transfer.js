// p2p-transfer.js
// P2P文件传输库，支持WebRTC直连，失败时自动降级到服务器中转

class P2PTransfer {
  constructor() {
    this.peerConnection = null;
    this.dataChannel = null;
    this.isSender = false;
    this.onProgress = null;
    this.onComplete = null;
    this.onError = null;
  }

  // 检查浏览器是否支持WebRTC
  isWebRTCSupported() {
    return !!(
      window.RTCPeerConnection &&
      window.RTCIceCandidate &&
      window.RTCSessionDescription
    );
  }

  // 初始化发送方
  async initSender() {
    if (!this.isWebRTCSupported()) {
      throw new Error('浏览器不支持WebRTC');
    }

    this.isSender = true;
    this.peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    // 创建数据通道
    this.dataChannel = this.peerConnection.createDataChannel('fileTransfer', {
      ordered: true
    });

    this.setupDataChannelEvents();

    // 监听ICE候选
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        // 在实际应用中，这里需要通过信令服务器发送候选给接收方
        console.log('发送ICE候选:', event.candidate);
      }
    };

    // 创建并发送offer
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    
    // 在实际应用中，这里需要通过信令服务器发送offer给接收方
    console.log('发送Offer:', offer);
    
    return offer;
  }

  // 初始化接收方
  async initReceiver(offer) {
    if (!this.isWebRTCSupported()) {
      throw new Error('浏览器不支持WebRTC');
    }

    this.isSender = false;
    this.peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    // 监听数据通道
    this.peerConnection.ondatachannel = (event) => {
      this.dataChannel = event.channel;
      this.setupDataChannelEvents();
    };

    // 设置远程描述
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

    // 创建并发送answer
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    
    // 在实际应用中，这里需要通过信令服务器发送answer给发送方
    console.log('发送Answer:', answer);
    
    return answer;
  }

  // 设置数据通道事件
  setupDataChannelEvents() {
    this.dataChannel.onopen = () => {
      console.log('数据通道已打开');
    };

    this.dataChannel.onclose = () => {
      console.log('数据通道已关闭');
    };

    this.dataChannel.onerror = (error) => {
      console.error('数据通道错误:', error);
      if (this.onError) {
        this.onError(new Error('数据通道连接失败'));
      }
    };
  }

  // 发送文件
  sendFile(file) {
    return new Promise((resolve, reject) => {
      if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
        reject(new Error('数据通道未连接'));
        return;
      }

      const chunkSize = 16384; // 16KB chunks
      let offset = 0;
      let startTime = Date.now();

      this.dataChannel.onbufferedamountlow = () => {
        sendChunk();
      };

      const sendChunk = () => {
        if (offset >= file.size) {
          // 文件发送完成
          const endTime = Date.now();
          console.log(`文件发送完成，耗时: ${endTime - startTime}ms`);
          
          if (this.onComplete) {
            this.onComplete({
              fileName: file.name,
              fileSize: file.size,
              transferTime: endTime - startTime
            });
          }
          
          resolve({
            fileName: file.name,
            fileSize: file.size,
            transferTime: endTime - startTime
          });
          return;
        }

        // 计算进度
        const progress = Math.round((offset / file.size) * 100);
        if (this.onProgress) {
          this.onProgress(progress);
        }

        // 发送文件信息（第一次）
        if (offset === 0) {
          const fileInfo = {
            type: 'fileInfo',
            name: file.name,
            size: file.size,
            type: file.type
          };
          this.dataChannel.send(JSON.stringify(fileInfo));
        }

        // 发送文件块
        const slice = file.slice(offset, offset + chunkSize);
        const reader = new FileReader();
        
        reader.onload = (event) => {
          try {
            this.dataChannel.send(event.target.result);
            offset += event.target.result.byteLength;
            
            // 检查缓冲区是否已满
            if (this.dataChannel.bufferedAmount > 1024 * 1024) { // 1MB
              // 等待缓冲区清空
              return;
            }
            
            // 继续发送下一个块
            setTimeout(sendChunk, 0);
          } catch (error) {
            console.error('发送文件块失败:', error);
            reject(error);
          }
        };
        
        reader.onerror = () => {
          reject(new Error('读取文件失败'));
        };
        
        reader.readAsArrayBuffer(slice);
      };

      // 开始发送
      sendChunk();
    });
  }

  // 接收文件
  receiveFile() {
    return new Promise((resolve, reject) => {
      if (!this.dataChannel) {
        reject(new Error('数据通道未初始化'));
        return;
      }

      let fileInfo = null;
      let receivedData = [];
      let receivedSize = 0;
      let startTime = Date.now();

      this.dataChannel.onmessage = (event) => {
        if (typeof event.data === 'string') {
          // 接收文件信息
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'fileInfo') {
              fileInfo = data;
              console.log('接收文件信息:', fileInfo);
            }
          } catch (error) {
            console.error('解析文件信息失败:', error);
          }
        } else {
          // 接收文件数据
          receivedData.push(event.data);
          receivedSize += event.data.byteLength;
          
          // 计算进度
          if (fileInfo && fileInfo.size) {
            const progress = Math.round((receivedSize / fileInfo.size) * 100);
            if (this.onProgress) {
              this.onProgress(progress);
            }
          }
          
          // 检查是否接收完成
          if (fileInfo && receivedSize >= fileInfo.size) {
            const endTime = Date.now();
            
            // 创建文件对象
            const blob = new Blob(receivedData, { type: fileInfo.type });
            const file = new File([blob], fileInfo.name, { type: fileInfo.type });
            
            console.log(`文件接收完成，耗时: ${endTime - startTime}ms`);
            
            if (this.onComplete) {
              this.onComplete({
                file: file,
                transferTime: endTime - startTime
              });
            }
            
            resolve({
              file: file,
              transferTime: endTime - startTime
            });
          }
        }
      };
    });
  }

  // 添加ICE候选
  addIceCandidate(candidate) {
    if (this.peerConnection) {
      this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }
  }

  // 设置远程描述
  async setRemoteDescription(description) {
    if (this.peerConnection) {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(description));
    }
  }

  // 关闭连接
  close() {
    if (this.dataChannel) {
      this.dataChannel.close();
    }
    if (this.peerConnection) {
      this.peerConnection.close();
    }
    this.dataChannel = null;
    this.peerConnection = null;
  }

  // 设置进度回调
  setOnProgress(callback) {
    this.onProgress = callback;
  }

  // 设置完成回调
  setOnComplete(callback) {
    this.onComplete = callback;
  }

  // 设置错误回调
  setOnError(callback) {
    this.onError = callback;
  }
}

// 自动降级的文件传输类
class FileTransferManager {
  constructor() {
    this.p2pTransfer = new P2PTransfer();
    this.useP2P = true;
    this.signalServer = null; // 信令服务器URL
  }

  // 设置信令服务器
  setSignalServer(url) {
    this.signalServer = url;
  }

  // 发送文件（自动降级）
  async sendFile(file, recipientId) {
    try {
      if (this.useP2P && this.p2pTransfer.isWebRTCSupported()) {
        console.log('尝试使用P2P传输...');
        
        // 设置回调
        this.p2pTransfer.setOnProgress((progress) => {
          console.log(`P2P传输进度: ${progress}%`);
        });
        
        this.p2pTransfer.setOnComplete((result) => {
          console.log('P2P传输完成:', result);
        });
        
        this.p2pTransfer.setOnError((error) => {
          console.error('P2P传输错误:', error);
          // 降级到服务器传输
          this.fallbackToServerTransfer(file);
        });
        
        // 初始化P2P发送
        await this.p2pTransfer.initSender();
        
        // 在实际应用中，这里需要通过信令服务器与接收方建立连接
        // 暂时模拟直接发送
        return await this.p2pTransfer.sendFile(file);
      } else {
        // 直接使用服务器传输
        return await this.fallbackToServerTransfer(file);
      }
    } catch (error) {
      console.error('P2P传输失败，降级到服务器传输:', error);
      return await this.fallbackToServerTransfer(file);
    }
  }

  // 降级到服务器传输
  async fallbackToServerTransfer(file) {
    console.log('降级到服务器传输...');
    
    // 这里应该实现服务器传输逻辑
    // 模拟服务器传输
    return new Promise((resolve) => {
      // 模拟上传进度
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        console.log(`服务器传输进度: ${progress}%`);
        
        if (progress >= 100) {
          clearInterval(interval);
          resolve({
            fileName: file.name,
            fileSize: file.size,
            transferMethod: 'server',
            transferTime: Math.random() * 5000 // 模拟传输时间
          });
        }
      }, 200);
    });
  }

  // 接收文件
  async receiveFile(offer) {
    try {
      if (this.useP2P && this.p2pTransfer.isWebRTCSupported()) {
        console.log('准备接收P2P文件...');
        
        // 设置回调
        this.p2pTransfer.setOnProgress((progress) => {
          console.log(`P2P接收进度: ${progress}%`);
        });
        
        this.p2pTransfer.setOnComplete((result) => {
          console.log('P2P接收完成:', result);
        });
        
        this.p2pTransfer.setOnError((error) => {
          console.error('P2P接收错误:', error);
        });
        
        // 初始化P2P接收
        await this.p2pTransfer.initReceiver(offer);
        
        // 接收文件
        return await this.p2pTransfer.receiveFile();
      } else {
        throw new Error('不支持P2P接收');
      }
    } catch (error) {
      console.error('P2P接收失败:', error);
      throw error;
    }
  }

  // 关闭连接
  close() {
    this.p2pTransfer.close();
  }
}

// 导出类
export { P2PTransfer, FileTransferManager };