var Data = require('Data');
var Func = Data.func;
var ToolJs = require('Tool');
var Tool = ToolJs.Tool;
var AlertshelfJs = require('AlertShelf');
var Alertshelf = AlertshelfJs.Alertshelf;

cc.Class({
  extends: cc.Component,

  properties: {
    goods_Prefab: {
      default: null,
      type: cc.Prefab
    },
    modal_Perfab: {
      default: null,
      type: cc.Prefab
    },
    btnRed_Prefab: {
      default: null,
      type: cc.Prefab
    },
    btnWhite_Prefab: {
      default: null,
      type: cc.Prefab
    },
    btnGray_Prefab: {
      default: null,
      type: cc.Prefab
    },

    chickNode: null
  },
  loadSceneIndex() {
    cc.director.loadScene(Config.backIndexUrl);
  },
  //加载系统道具
  leftBtnEvent() {
    //样式切换
    this.leftLineNode.active = true;
    this.rightLineNode.active = false;
    this.leftLabelNode.color = cc.color('#FF4C4C');
    this.rightLabelNode.color = cc.color('#444444');

    this.GetSystemListByPage();
  },
  //加载流通物品
  rightBtnEvent() {
    //样式切换
    this.leftLineNode.active = false;
    this.rightLineNode.active = true;
    this.leftLabelNode.color = cc.color('#444444');
    this.rightLabelNode.color = cc.color('#FF4C4C');

    this.GetRepertoryList();
  },

  onLoad() {
    this.leftNode = cc.find('bg/tab/left', this.node);
    this.rightNode = cc.find('bg/tab/right', this.node);
    this.leftLineNode = cc.find('line', this.leftNode);
    this.rightLineNode = cc.find('line', this.rightNode);
    this.leftLabelNode = cc.find('label', this.leftNode);
    this.rightLabelNode = cc.find('label', this.rightNode);

    this.chickNode = cc.find('Chick', this.node);

    this.leftNode.on('click', this.leftBtnEvent, this);
    this.rightNode.on('click', this.rightBtnEvent, this);

    this.GetSystemListByPage();
  },
  //系统仓库数据
  GetSystemListByPage() {
    this.goodsListNode = cc.find('bg/bg-f3/PageView/view/content/page_1/goodsList', this.node);
    this.goodsListNode.removeAllChildren();
    this.emptyNode = cc.find('bg/bg-f3/PageView/empty', this.node);
    this.emptyNode.active = false;
    Func.GetSystemListByPage().then(data => {
      if (data.Code === 1) {
        let list = data.List;
        // let chickItem;
        // for (let i = 0; i < list.length; i++) {
        //   const goods = list[i];
        //   if (goods.Type === 1) {
        //     chickItem = list.splice(i, 1);
        //   }
        // }
        // list.unshift(...chickItem);
        if (list.length > 0) {
          for (let i = 0; i < list.length; i++) {
            const goods = list[i];

            let goodsNode = cc.instantiate(this.goods_Prefab);
            if (goods.Count > 0) {
              this.assignData(goods, goodsNode);
              this.goodsListNode.addChild(goodsNode);
              this.emptyNode = null;
            }
          }
          this.emptyNode = null;
        } else {
          this.emptyNode.active = true;
        }
      } else {
        this.emptyNode.active = true;
        Msg.show(data.Message);
      }

      //Loading.hide();
      //新手指引
      // if (Config.firstLogin) GuideSystem.guide();
    });
  },
  //流通物品
  GetRepertoryList() {
    this.goodsListNode = cc.find('bg/bg-f3/PageView/view/content/page_1/goodsList', this.node);
    this.goodsListNode.removeAllChildren();
    this.emptyNode = cc.find('bg/bg-f3/PageView/empty', this.node);
    this.emptyNode.active = false;
    Func.GetRepertoryList().then(data => {
      if (data.Code === 1) {
        let list = data.List;
        if (list.length > 0) {
          for (let i = 0; i < list.length; i++) {
            const goods = list[i];
            let goodsNode = cc.instantiate(this.goods_Prefab);
            this.assignData(goods, goodsNode);
            this.goodsListNode.addChild(goodsNode);
          }
        } else {
          this.emptyNode ? (this.emptyNode.active = true) : false;
        }
      } else {
        Msg.show(data.Message);
        this.emptyNode ? (this.emptyNode.active = true) : false;
      }
      //Loading.hide();
    });
  },
  //根据不同的type 加载不同的图片，文字，数量 绑定回调函数
  assignData(goods, goodsNode) {
    //获取组件
    let goodSprite = cc.find('img', goodsNode).getComponent(cc.Sprite);
    let countLabel = cc.find('icon-tip/count', goodsNode).getComponent(cc.Label);
    let nameLabel = cc.find('name', goodsNode).getComponent(cc.Label);
    //获取物品数据
    let PropertyTypeID = goods.PropertyTypeID;
    let PropName = goods.PropName || goods.TypeName;
    let count = goods.Count;
    switch (PropertyTypeID) {
      // 鸡蛋
      case 2:
        cc.loader.loadRes('Modal/Repertory/img-egg', cc.SpriteFrame, function(err, spriteFrame) {
          goodSprite.spriteFrame = spriteFrame;
        });
        this.bindGoodsEvent(
          goodsNode,
          () => {
            this.shelfEvent(PropName, 2, goodsNode);
          },
          '上架',
          () => {
            this.exChange(PropName, 2);
          },
          '兑换',
          () => false,
          '下架'
        );
        break;
      // 普通饲料
      case 4:
        cc.loader.loadRes('Modal/Repertory/feed', cc.SpriteFrame, function(err, spriteFrame) {
          goodSprite.spriteFrame = spriteFrame;
        });
        this.bindGoodsEvent(goodsNode, this.feed, '添加饲料槽');
        break;
      // 成长加速剂
      case 5:
        cc.loader.loadRes('Modal/Repertory/feed', cc.SpriteFrame, function(err, spriteFrame) {
          goodSprite.spriteFrame = spriteFrame;
        });
        this.bindGoodsEvent(goodsNode, () => Msg.show('暂时还未开通该道具功能'), '使用');
        break;
      // 普通肥料
      case 7:
        cc.loader.loadRes('Shop/hf', cc.SpriteFrame, function(err, spriteFrame) {
          goodSprite.spriteFrame = spriteFrame;
        });
        this.bindGoodsEvent(
          goodsNode,
          () => {
            this.compound(3, 7, '肥料');
          },
          '合成'
        );
        break;
      //粪便
      case 8:
        cc.loader.loadRes('Modal/Repertory/img-db', cc.SpriteFrame, function(err, spriteFrame) {
          goodSprite.spriteFrame = spriteFrame;
        });
        this.bindGoodsEvent(
          goodsNode,
          () => {
            this.compound(2, 8, '粪便');
          },
          '合成'
        );
        break;

      // 超级肥料
      case 9:
        cc.loader.loadRes('Shop/cjhf_ck', cc.SpriteFrame, function(err, spriteFrame) {
          goodSprite.spriteFrame = spriteFrame;
        });
        // this.bindGoodsEvent(goodsNode, this.feed, '添加饲料槽');
        break;
      // 产蛋鸡
      case 13:
        cc.loader.loadRes('Modal/Repertory/img-hen', cc.SpriteFrame, function(err, spriteFrame) {
          goodSprite.spriteFrame = spriteFrame;
        });
        this.bindGoodsEvent(
          goodsNode,
          () => {
            this.shelfEvent(PropName, 1, goodsNode);
          },
          '上架',
          () => {
            this.exChange(PropName, 1);
          },
          '兑换',
          () => false,
          '下架'
        );
        break;
      //改名卡
      case 14:
        cc.loader.loadRes('Modal/Repertory/gmk1', cc.SpriteFrame, function(err, spriteFrame) {
          goodSprite.spriteFrame = spriteFrame;
        });
        // this.bindGoodsEvent(goodsNode, this.feed, '添加饲料槽');
        break;
      //玉米种子和玉米
      case 6:
        // 玉米种子
        if (goods.Type === 0) {
          cc.loader.loadRes('Modal/Repertory/ymzz1', cc.SpriteFrame, function(err, spriteFrame) {
            goodSprite.spriteFrame = spriteFrame;
          });
        } else {
          //玉米
          cc.loader.loadRes('Modal/Repertory/img-ym', cc.SpriteFrame, function(err, spriteFrame) {
            goodSprite.spriteFrame = spriteFrame;
          });
          this.bindGoodsEvent(
            goodsNode,
            () => {
              this.compound(1, 12, '玉米');
            },
            '合成'
          );
        }
        break;
    }
    nameLabel.string = PropName;
    countLabel.string = count;
  },
  // 绑定点击事件及回调函数(f1,f2,f3表示三个回调函数，name1，name2,name3表示按钮文字)
  bindGoodsEvent(goodsNode, f1, name1, f2, name2, f3, name3) {
    goodsNode.on(
      'click',
      event => {
        //绑定this到goodsNode上 （红、白、灰三个按钮的回调）
        this.goodsEvent.call(goodsNode, [f1, f2, f3], [name1, name2, name3]);
      },
      this
    );
    goodsNode.on(
      'maskClick',
      event => {
        //绑定this到goodsNode上 （红、白、灰三个按钮的回调）
        this.goodsEvent.call(goodsNode, [f1, f2, f3], [name1, name2, name3]);
      },
      this
    );
  },
  //点击商品事件 绑定模态框回调函数及图片、名字
  goodsEvent() {
    //回调函数
    let f1 = arguments[0][0];
    let f2 = arguments[0][1];
    let f3 = arguments[0][2];
    //按钮名称
    let name1 = arguments[1][0];
    let name2 = arguments[1][1];
    let name3 = arguments[1][2];
    //this 绑定在goodsNode（该物品上）
    let spriteFrame = cc.find('img', this).getComponent(cc.Sprite).spriteFrame;
    let name = cc.find('name', this).getComponent(cc.Label).string;
    //获得js的上下文
    let that = cc.find('Canvas').getComponent('Repertory');
    //获得组件
    let modalNode = cc.instantiate(that.modal_Perfab);
    let bgNode = cc.find('bg', modalNode);
    let imgNode = cc.find('div/img', modalNode);
    let imgSprite = imgNode.getComponent(cc.Sprite);
    let modalNameLabel = cc.find('div/name', modalNode).getComponent(cc.Label);
    let btnGroupNode = cc.find('div/btn-group', modalNode);
    //赋值 图片和道具名称
    imgSprite.spriteFrame = spriteFrame;
    modalNameLabel.string = name;
    //加入按钮
    if (f1) {
      let btnRedNode = cc.instantiate(that.btnRed_Prefab);
      let btnLabel = cc.find('label', btnRedNode).getComponent(cc.Label);
      btnLabel.string = name1;
      btnGroupNode.addChild(btnRedNode);
      btnRedNode.on('click', f1, that);
      btnRedNode.on('maskClick', f1, that);
    }
    if (f2) {
      let btnWhiteNode = cc.instantiate(that.btnWhite_Prefab);
      let btnLabel = cc.find('label', btnWhiteNode).getComponent(cc.Label);
      btnLabel.string = name2;
      btnGroupNode.addChild(btnWhiteNode);
      btnWhiteNode.on('click', f2, that);
    }
    // if (f3) {
    //   let btnGrayNode = cc.instantiate(that.btnGray_Prefab);
    //   let btnLabel = cc.find("label", btnGrayNode).getComponent(cc.Label);
    //   btnLabel.string = name3;
    //   btnGroupNode.addChild(btnGrayNode);
    //   btnGrayNode.on("click", f3, that);
    // }

    //fadeIn 进入动画
    modalNode.opacity = 0;
    modalNode.runAction(cc.fadeIn(0.3));
    //关闭模态框
    bgNode.on('click', () => {
      Tool.closeModal(modalNode);
    });
    that.node.addChild(modalNode);
  },
  //孵化小鸡回调
  hatchEgg() {
    cc.director.loadScene('index', () => {
      let sceneNode = cc.find('Canvas');
      let indexJs = sceneNode.getComponent('Index');
      indexJs.operate = 0;
    });
  },
  //添加饲料槽
  feed() {
    cc.director.loadScene('index', () => {
      let sceneNode = cc.find('Canvas');
      let indexJs = sceneNode.getComponent('Index');
      indexJs.operate = 1;
    });
  },
  //点击上架 弹出模态框
  shelfEvent(name, type, goodsNode) {
    Alertshelf.show(name, () => {
      this.OnShelf(type, goodsNode);
    });
  },
  //上架事件（点击确定的回调）
  OnShelf(type, goodsNode) {
    // Msg.show('接口还在开发中');
    let countLabel = cc.find('icon-tip/count', goodsNode).getComponent(cc.Label);
    //获取输入框的价格及数量
    let unitprice = Alertshelf._price;
    let count = Alertshelf._count;
    Func.OnShelf(type, unitprice, count)
      .then(data => {
        if (data.Code === 1) {
          Msg.show(data.Message);
          if (data.Model > 0) {
            countLabel.string = data.Model;
          } else {
            goodsNode.removeFromParent();
          }
        } else {
          Msg.show(data.Message);
        }
      })
      .catch(data => {
        Msg.show(data.Message);
      });
  },
  //兑换事件
  exChange(name, type) {
    // Msg.show('接口还在开发中');
    // 放到Config.js做中转;
    Config.exchangeData.actualName = name;
    Config.exchangeData.actualCount = 1;
    Config.exchangeData.virtualName = name;
    if (type == 2) {
      Config.exchangeData.virtualCount = 1;
    } else if (type == 1) {
      Config.exchangeData.virtualCount = 1;
    }
    Config.exchangeData.goodsType = type;
    cc.director.loadScene('exchange');
  },
  //合成
  compound(productType, makeId, makeName) {
    cc.loader.loadRes('Prefab/Modal/Repertory/compound', cc.Prefab, (err, prefab) => {
      let compoundNode = cc.instantiate(prefab);
      let compoundJs = compoundNode.getComponent('compound');
      compoundJs.productType = productType;
      compoundJs.makeId = makeId;
      compoundJs.makeName = makeName;
      this.node.addChild(compoundNode);
    });
  },
  start() {}

  // update (dt) {},
});
