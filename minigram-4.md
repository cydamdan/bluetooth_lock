# 一卡通——智能门锁

#### 项目使用组件库——vant weapp

### 1. 快捷智能门锁

![](C:\Users\Administrator\Desktop\记录\img\智能门锁.png)

###### 功能说明：

1. 通过“智能门锁”按钮快速连接“常用”宿舍的门锁蓝牙模块，实现快捷开门。

2. 设备码与蓝牙适配器特殊值对应则开门成功。

3. 设备码与蓝牙适配器特殊值不对则开门失败，自动返回上一个页面。

   ###### 效果图：

   开门失败

   ![](C:\Users\Administrator\Desktop\记录\img\开门失败.png)

   开门成功

   

   

   

   

   

   

   

   -----------

   

### 2.公寓

![](C:\Users\Administrator\Desktop\记录\img\公寓.png)

###### 功能说明：

1. 所有楼栋的所有宿舍的集合，宿管可通过这里实现蓝牙开门。
2. 可以添加“常用”宿舍，但每个人只能有一个“常用”宿舍。
3. 可以查看对应的宿舍门锁电量。
4. 宿管可以查看每个宿舍开门时间。







### 3.功能实现记录

###### 快捷智能门锁

1. **根据'常用'的数组信息,对已连接过那一个门锁进行蓝牙开锁**

   

----------



###### 公寓

1. 使用了vant weapp中的 Tree Select分类选择组件。

   在[^app.json] 进行全局引入，或者在[^apartment.json] 进行局部按需引入

   `"usingComponents": {  "van-tree-select": "@vant/weapp/tree-select/index" }`

   在[^apartment.wxml] 中任意位置使用 van-tree-select 标签，传入对应的数据即可.

   ```<van-tree-select  ```

   ```items="{{ items }}"  ```

   ```main-active-index="{{ mainActiveIndex }}"  ```

   ```active-id="{{ activeId }}"  ```

   ```bind:click-nav="onClickNav"  ```

   ```bind:click-item="onClickItem" />```

   > 其中`items`可在[^apartment.js] 中的data中进行定义,`items` 整体为一个数组，数组内包含一系列描述分类的对象。每个分类里，text 表示当前分类的名称。children 表示分类里的可选项，为数组结构，id 被用来唯一标识每个选项。

   `mainActiveIndex`是左侧选项卡中的数组下标===>`items[mainActiveIndex]`

   `activeId `是右侧选项卡中被选中的元素id===>`items[mainAcitiveIndex].children[activeId].id`

   `onClickNav`是左侧导航点击时触发的事件

   `onClickItem`是右侧选择项被点击时，会触发的事件

   效果图:

   ![image-20230713164654618](C:\Users\Administrator\Desktop\记录\img\image-20230713164654618.png)

2. '常用'按钮

   ```javascript
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
     }
   ```

3. 将'常用'数组的内容写入本地缓存并在用户退出后下一次页面显示时重新读取本地缓存数据并将数据重新渲染到页面上

   ######  注意：只有一个常用且不会对这个常用就行更改时，读取本地缓存数据并渲染到页面的操作应放在onReady函数中，若放在onShow函数中，则会出现连接后返回apartment页面时‘我的常用’出现两个一样宿舍的bug。

   ```javascript
   //声明存储本地缓存数据的全局变量
   var apartmentData; 
   
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
   
   /**
      * 生命周期函数--监听页面初次渲染完成，一个页面只会调用一次，表示页面已经准备完成，可以和视图层进行交互。
      */
     onReady() {
       this.getDataStroage();
       // 数组赋值(将数组从本地缓存中读取数据并渲染到页面)
       if(apartmentData.length>0){
         console.log(apartmentData);
         this.data.items[0].children.push({text:apartmentData[0].text,id:apartmentData[0].id});
         this.setData({
           items: this.data.items
         })
       }
   ```

   如果按之前版本有管理常用页面，管理常用里会进行删除操作的话，则``` this.getDataStroage();```及以下的代码都应写在onshow函数中，因为onShow函数每次打开页面都会调用一次，就可以重新将管理常用页面中进行删除操作后的新数组重新渲染到apartment页面。

   (有管理常用页面且多个'常用'循环读取渲染)

   ```javascript
   //数组赋值(将数组清零后重新读取本地缓存循环渲染到页面)
       if(apartmentData.length!==this.data.items[0].children.length){
         let oldUsualApartment = `items[0].children`;
         this.setData({
           [oldUsualApartment]:[]
         })
         // 清零后进行循环渲染
       for(let i=0;i<apartmentData.length;i++){
         if(apartmentData.length>0){ //本地缓存中有数据，将数据循环渲染到页面
           this.data.items[0].children.push({text:apartmentData[i].text,id:apartmentData[i].id});
         }
       }
       this.setData({
         items:this.data.items
       })
       }
   ```

4. **开门,连接门锁蓝牙模块进行匹配开锁**







5. **将已连接的蓝牙设备电池电量显示到页面上**

   由于用的是组件库,因此要在`\miniprogram-4\miniprogram_npm\@vant\weapp\tree-select`中修改[^index.js]和[^index.wxml]相关代码内容.

   





6. **从日志记录中读取开锁时间记录,并将时间记录显示到页面上**

   由于用的是组件库,因此要在`\miniprogram-4\miniprogram_npm\@vant\weapp\tree-select`中修改[^index.js]和[^index.wxml]相关代码内容.









