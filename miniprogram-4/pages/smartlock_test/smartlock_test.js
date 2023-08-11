var apartmentData;
Page({
  data: {
    value: 0,
    text:"正在连接",
    // 剩下的进度条,为了使环形进度条实现动画闭合效果
    num:100,
      // 常用宿舍号
    usual: '',
     // 用于存放蓝牙设备的数组
    devices: [],
    // 是否连接成功，决定了开门的成功与失败
    connected: false,
    chs: [], 
    // 没有扫描
    misScanding: false
  },
  // 从本地缓存中读取常用宿舍数据
  getDataStroage(){
    // 同步读取本地缓存数据
    apartmentData = wx.getStorageSync('apartment');
    console.log(apartmentData);
  },

  // 初始化蓝牙模块
  openBluetoothAdapter() {
    this.misScanding = false
    wx.openBluetoothAdapter({
      success: (res) => {
        console.log('openBluetoothAdapter success', res)
        this.startBluetoothDevicesDiscovery()
      },
      fail: (res) => {
        if (res.errCode === 10001) {
          wx.onBluetoothAdapterStateChange(function (res) {
            console.log('onBluetoothAdapterStateChange', res)
            if (res.available) {
              this.startBluetoothDevicesDiscovery()
            }
          })
        }
      }
    })
  },

  // 获取蓝牙适配器状态码
  getBluetoothAdapterState() {
    wx.getBluetoothAdapterState({
      success: (res) => {
        console.log('getBluetoothAdapterState', res)
        if (res.discovering) {
          this.onBluetoothDeviceFound()
        } else if (res.available) {
          this.startBluetoothDevicesDiscovery()
        }
      }
    })
  },

  // 开始搜寻附近的蓝牙外围设备
  startBluetoothDevicesDiscovery() {
    var that = this;
    if (this._discoveryStarted) {
      this.stopBluetoothDevicesDiscovery()
      return
    }
    this.setData({ misScanding: true, 
    scandbutName: "正在搜索，点击停止", 
      devices: [],
      chs: [],
    })
    //console.log('lisn3188---------- misScanding = ', this.misScanding)
    this._discoveryStarted = true
    wx.startBluetoothDevicesDiscovery({
      allowDuplicatesKey: true,
      success: (res) => {
        setTimeout(function () {
          console.log("----BluetoothDevicesDiscovery finish---- ");
          if (that._discoveryStarted){
            that.stopBluetoothDevicesDiscovery()
          }
        }, 20000);
        console.log('startBluetoothDevicesDiscovery success', res)
        this.onBluetoothDeviceFound()
      },
    })
  },

  // 找到要搜索的设备后，及时停止扫描
  stopBluetoothDevicesDiscovery() {
    this._discoveryStarted = false
    wx.stopBluetoothDevicesDiscovery()
    this.setData({ misScanding: false, scandbutName:"重新刷新列表", })
    //console.log('lisn3188---------- misScanding = ', this.misScanding)
  },

  // 监听扫描到新设备事件
  onBluetoothDeviceFound() {
    wx.onBluetoothDeviceFound((res) => {
      res.devices.forEach(device => {
        if (!device.name && !device.localName) {
          return
        }
        const foundDevices = this.data.devices
        const idx = inArray(foundDevices, 'deviceId', device.deviceId)
        const data = {}
        if (idx === -1) {
          data[`devices[${foundDevices.length}]`] = device
        } else {
          data[`devices[${idx}]`] = device
        }
        this.setData(data)
      })
    })
  },goto_Comm(e){
    app.globalData.ble_device = e.currentTarget.dataset
    this.stopBluetoothDevicesDiscovery()
    wx.navigateTo({
      url: '/pages/comm/comm',
    })
  },

  // 蓝牙低功耗设备间要进行通信，必须首先建立连接
  createBLEConnection(e) {
    const ds = e.currentTarget.dataset
    const deviceId = ds.deviceId
    const name = ds.name
    wx.createBLEConnection({
      deviceId,
      success: (res) => {
        this.setData({
          connected: true,
          name,
          deviceId,
        })
        this.getBLEDeviceServices(deviceId)
      }
    })
    this.stopBluetoothDevicesDiscovery()
  },

  // 断开蓝牙连接
  closeBLEConnection() {
    wx.closeBLEConnection({
      deviceId: this.data.deviceId
    })
    this.setData({
      connected: false,
      chs: [],
      canWrite: false,
    })
  },

  // 获取蓝牙外围设备的服务
  getBLEDeviceServices(deviceId) {
    wx.getBLEDeviceServices({
      deviceId,
      success: (res) => {
        for (let i = 0; i < res.services.length; i++) {
          if (res.services[i].isPrimary) {
            this.getBLEDeviceCharacteristics(deviceId, res.services[i].uuid)
            return
          }
        }
      }
    })
  },

  // 获取蓝牙外围设备的服务特征值
  getBLEDeviceCharacteristics(deviceId, serviceId) {
    wx.getBLEDeviceCharacteristics({
      deviceId,
      serviceId,
      success: (res) => {
        console.log('getBLEDeviceCharacteristics success', res.characteristics)
        for (let i = 0; i < res.characteristics.length; i++) {
          let item = res.characteristics[i]
          if (item.properties.read) {
            wx.readBLECharacteristicValue({
              deviceId,
              serviceId,
              characteristicId: item.uuid,
            })
          }
          if (item.properties.write) {
            this.setData({
              canWrite: true
            })
            this._deviceId = deviceId
            this._serviceId = serviceId
            this._characteristicId = item.uuid
            this.writeBLECharacteristicValue()
          }
          if (item.properties.notify || item.properties.indicate) {
            wx.notifyBLECharacteristicValueChange({
              deviceId,
              serviceId,
              characteristicId: item.uuid,
              state: true,
            })
          }
        }
      },
      fail(res) {
        console.error('getBLEDeviceCharacteristics', res)
      }
    })
    // 操作之前先监听，保证第一时间获取数据
    wx.onBLECharacteristicValueChange((characteristic) => {
      const idx = inArray(this.data.chs, 'uuid', characteristic.characteristicId)
      const data = {}
      if (idx === -1) {
        data[`chs[${this.data.chs.length}]`] = {
          uuid: characteristic.characteristicId,
          value: ab2hex(characteristic.value)
        }
      } else {
        data[`chs[${idx}]`] = {
          uuid: characteristic.characteristicId,
          value: ab2hex(characteristic.value)
        }
      }
      // data[`chs[${this.data.chs.length}]`] = {
      //   uuid: characteristic.characteristicId,
      //   value: ab2hex(characteristic.value)
      // }
      this.setData(data)
    })
  },
  
  // 写入蓝牙服务特征值
  writeBLECharacteristicValue() {
    // 向蓝牙设备发送一个0x00的16进制数据
    let buffer = new ArrayBuffer(1)
    let dataView = new DataView(buffer)
    dataView.setUint8(0, Math.random() * 255 | 0)
    wx.writeBLECharacteristicValue({
      deviceId: this._deviceId,
      serviceId: this._deviceId,
      characteristicId: this._characteristicId,
      value: buffer,
    })
  },
  // 关闭蓝牙适配器
  closeBluetoothAdapter() {
    wx.closeBluetoothAdapter()
    this._discoveryStarted = false
  },
// 前往设置uuid页面
  gotosetuuid(){
    wx.navigateTo({
      url: '/pages/setuuid/setuuid',
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */  
  onLoad(){
    // this.openBluetoothAdapter();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    this.setData({
      value: this.data.value + this.data.num,
    })
    if(this.data.connected===true){
      // 延迟显示提示信息
      setTimeout(() => this.setData({
        text: this.data.value = "开门成功"
      }),1500); 
    }else{
      // 延迟显示提示信息
      setTimeout(() => this.setData({
        text: this.data.value = "开门失败"
      }),1000); 
      // 显示开门失败后返回首页
      setTimeout(()=>wx.navigateBack({
        delta:1
      }),2000)
    }
  },
  onShow(){
    this.getDataStroage();
    // 重新设置usual的值显示到页面上
    this.setData({
      usual: apartmentData[0].text
    })
  }
})
