// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import GameMain, { InfoType, OneInfo } from "./GameMain";
import { G_Event } from "./GloabData";
import { mainPlayerData } from "./PlayerData";

const { ccclass, property } = cc._decorator;

@ccclass
export default class OneSlot extends cc.Component {

    @property(cc.Label)
    labelName: cc.Label = null;

    cachedInfo: OneInfo = null;
    gameMain: GameMain = null;

    alreadyOpenNext: boolean = false;

    InitByInfo(info: OneInfo, main: GameMain) {
        this.cachedInfo = info
        this.gameMain = main
        this.labelName.string = info.name
        this.node.scale = info.scale

    }

    startTouchPos: cc.Vec3 = null;
    bIsTouchMove: boolean = false;
    protected start(): void {
        // this.node.on("click", this.clickFunc, this)
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this)
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this)
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this)
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this)

    }

    onTouchStart(tou: cc.Event) {
        this.bIsTouchMove = false;

        let touch: cc.Touch = tou["touch"]

        this.startTouchPos = cc.v3(0, 0)
        this.startTouchPos.x = this.node.convertToWorldSpaceAR(touch.getLocation()).x
        this.startTouchPos.y = this.node.convertToWorldSpaceAR(touch.getLocation()).y
    }

    onTouchMove(tou: cc.Event) {
        let touch: cc.Touch = tou["touch"]
        let currentTouch = this.node.convertToWorldSpaceAR(touch.getLocation())
        // console.log("+>>>>>>>>>>>>>>", currentTouch)
        if (this.startTouchPos) {
            //@ts-ignore
            let dis = this.startTouchPos.sub(currentTouch).mag()
            // console.log("dis>>>>", dis)
            if (dis > 20) {
                this.bIsTouchMove = true;
                let del = touch.getDelta()
                // cc.log("=???????????", touch.getDelta())
                this.node.x += del.x;
                this.node.y += del.y;
                this.cachedInfo.position = [this.node.x, this.node.y]

                G_Event.emit("Update_All_Line_node", this.cachedInfo)
            }
        }
    }

    onTouchEnd() {
        if (!this.bIsTouchMove) {
            this.clickFunc()
        }
        cc.tween(this)
            .delay(0.1)
            .call(() => {
                this.bIsTouchMove = false;
            })
            .start()
    }

    clickFunc() {
        this.cachedInfo.position[0] = this.node.x;
        this.cachedInfo.position[1] = this.node.y;
        G_Event.emit("Show_Slot_Des", this.cachedInfo.des)

        if (this.alreadyOpenNext) {
            cc.log("已经打开过了")
            return
        }
        if (this.cachedInfo.passw.length > 0) {
            //打开密码框,输入正确密码后
            G_Event.emit("Show_Pop_View", this.cachedInfo, this)
            // this.alreadyOpenNext = true;
            return
        }

        //可以拾取的道具,拾取了就消失,然后将keyid放入背包
        if (this.cachedInfo.type == InfoType.Item) {
            this.alreadyOpenNext = true;
            this.HideThisSlot();
            mainPlayerData.backpackItems.push(this.cachedInfo.keyid)
            G_Event.emit("Show_Tips", "拾取了[" + this.cachedInfo.name + "]")
            return;
        }

        //被锁住的门
        if (this.cachedInfo.lockid > 0) {
            //背包里拿到了对应的道具
            if (mainPlayerData.backpackItems.indexOf(this.cachedInfo.lockid) >= 0) {
                G_Event.emit("Open_One_Slot", this.cachedInfo)
                this.alreadyOpenNext = true;
            } else {
                G_Event.emit("Show_Tips", "可能需要道具打开")
            }
            return;
        }

        cc.log("=clickFunc===>", this.cachedInfo.to)

        G_Event.emit("Open_One_Slot", this.cachedInfo)
        this.alreadyOpenNext = true;
    }

    HideThisSlot() {
        this.node.active = false;
        //将连着的线也隐藏
        G_Event.emit("Hide_One_Slot", this.cachedInfo)
    }

    protected onDestroy(): void {
        this.cachedInfo = null;
        this.gameMain = null;
    }
}
