// pages/apartment_connect/apartment_connect.js
import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    devices:[]
  },
    // 第二步 开始搜索附近的蓝牙设备
    startBluetoothDevicesDiscovery() {
      wx.startBluetoothDevicesDiscovery({
        allowDuplicatesKey: false,
        success: (res) => {
          console.log('开始搜索附近的蓝牙设备', res)
          this.onBluetoothDeviceFound()
        },
      })
    },
      // 第三步 监听发现附近的蓝牙设备
  onBluetoothDeviceFound() {
    wx.onBluetoothDeviceFound((res) => {
      res.devices.forEach(device => {
        if (!device.name && !device.localName) { return }
        console.log("发现的蓝牙设备", device)
        this.data.devices.push(device)
        this.setData({ devices: this.data.devices })
      })
    })
  },
  // 第四步、 建立连接
  connectDevice: function (e) {
    const device = e.currentTarget.dataset.device
    wx.createBLEConnection({
      deviceId: device.deviceId,
      success: (res) => {
        console.log('createBLEConnection success', res)
        wx.showToast({ title: '蓝牙连接成功', icon: 'none' })
        this.stopBluetoothDevicesDiscovery()
        wx.navigateTo({
          url: '/pages/main/main?deviceId=' + device.deviceId
        })
      },
      fail: (res) => {
        wx.showToast({ title: '蓝牙连接失败', icon: 'none' })
      }
    })
  },
  // 第五步、 停止搜索
  stopBluetoothDevicesDiscovery(){
    wx.stopBluetoothDevicesDiscovery({
      success: function(res) {
        console.log('停止搜索成功');
      },
      fail: function(res) {
        console.log('停止搜索失败');
      }
    });
  },

  

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.openBluetoothAdapter({
      success:(res)=>{
        console.log('第一步，蓝牙适配器初始化完成',res);
        // 开始搜索附近蓝牙
        this.startBluetoothDevicesDiscovery();
      },
      // 如果失败显示提示信息
      fail:(res)=>{
        Toast.fail('请开启手机蓝牙');
        // 自动返回上一个页面
        setTimeout(()=>wx.navigateBack({
          delta:1
        }),1500)
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})