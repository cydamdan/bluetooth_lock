// pages/apartment/apartment.js
// 引入提示
import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast';
var apartmentData;
var usualApartment = [];
Page({
  
  data: {
    battery: '80',
    items:[
      {text:'我的常用',children:[]},
      // A区id第一位为1
      {text:'1A',children:[{text:'101',id:1101},{text:'102',id:1122},{text:'103',id:1103},{text:'104',id:'1104'},{text:'105',id:'1105'},{text:'106',id:'1107'},{text:'108',id:'1108'},{text:'109',id:'1109'},{text:'110',id:'1110'}]},
      // B区id第一位为2
      {text:'1B',children:[{text:'101',id:2101},{text:'102',id:2102},{text:'103',id:2103},{text:'104',id:'2104'},{text:'105',id:'2105'}]},
      // C区id第一位为3
      {text:'1C',children:[{text:'101',id:3101},{text:'102',id:3102},{text:'103',id:3103},{text:'104',id:'3104'},{text:'105',id:'3105'}]},
    ],
    // 右侧选项栏中被选中的元素id--->items[mainActiveIndex].children[activeId].id
    activeId:null,
    // 左侧选项卡中被选中的元素的下标--->items[]
    mainActiveIndex:0
  },
  onClickNav({detail={}}){
    this.setData({
      mainActiveIndex:detail.index || 0,
    });
  },
  onClickItem({ detail = {} }) {
    const activeId = this.data.activeId === detail.id ? null : detail.id;
    this.setData({ activeId });
  },
// 点击设为常用后将对应的宿舍添加到我的常用数组中
  addUsual(){
    // 首先要获取选中的id
    let activeId = this.data.activeId;
    let mainActiveIndex = this.data.mainActiveIndex;
    // 判断是否已经有常用宿舍
    if(this.data.items[0].children.length === 0){//没有常用宿舍了
      if(this.data.activeId===null){ //判断是否误触添加常用
        Toast.fail('请选择宿舍');
        // 将数组清空
        this.data.items[0].children=[];
      }else{
        // 使用findIndex(),根据选中的id获取对应id对象所有数据
      let index = this.data.items[mainActiveIndex].children.findIndex(function(event){
        return event.id === activeId;
        });
        let addObj = this.data.items[mainActiveIndex].children[index];
        // 用push()方法将对象添加到数组中
        this.data.items[0].children.push(addObj);
        this.setData({
          items: this.data.items
        })
        // console.log(this.data.items[0].children);
        this.saveDataStorage();
        Toast.success('添加常用成功');
      }
    }else{  //已经有常用宿舍了
      if(apartmentData[0].id === activeId){ //判断是否点击的是已经添加过的常用宿舍
        Toast.fail('已添加');
      }else{
        Toast.fail('只能有一个常用宿舍');
      }
    }
  },
  // Storage缓存,将当前页面数据缓存到手机上，然后在其他页面读取缓存使用数据
  saveDataStorage(){
    let apartmentData = this.data.items[0].children;
    // 同步写入缓存
    wx.setStorageSync('apartment', apartmentData);
  },
  // 读取本地缓存的数据
  getDataStroage(){
    // 同步读取本地缓存数据
    apartmentData = wx.getStorageSync('apartment');
  },

  // 监听页面初次渲染完成
  onReady(){
    this.getDataStroage();
    // 数组赋值(将数组从本地缓存中读取数据并渲染到页面)
    if(apartmentData.length>0){
      // console.log(apartmentData);
      this.data.items[0].children.push({text:apartmentData[0].text,id:apartmentData[0].id});
      this.setData({
        items: this.data.items
      })
    }
  },
})