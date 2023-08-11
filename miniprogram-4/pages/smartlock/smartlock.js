
Page({
  data: {
    value: 0,
    text:"正在连接",
    // 剩下的进度条,为了使环形进度条实现动画闭合效果
    num:100,
    // 蓝牙连接速度,决定了开门的成功与失败
    btSpeed:99
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    this.setData({
      value: this.data.value + this.data.num,
    })
    if(this.data.btSpeed >= 100){
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

})
