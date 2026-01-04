// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { OneInfo } from "./GameMain";
import { G_Event } from "./GloabData";
import OneSlot from "./OneSlotNode";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopViewNode extends cc.Component {
    @property(cc.Button)
    btnClose: cc.Button = null;
    @property(cc.Button)
    btnConfim: cc.Button = null;
    @property(cc.EditBox)
    EditBox: cc.EditBox = null;


    cachedInfo: OneInfo = null
    cachedsNode: OneSlot = null
    protected start(): void {
        this.btnClose.node.on("click", () => {
            this.ClosePop()
        }, this)


        this.btnConfim.node.on("click", () => {

            if (this.cachedInfo && this.EditBox.string == this.cachedInfo.passw) {
                G_Event.emit("Open_One_Slot", this.cachedInfo)
                this.ClosePop()
                this.cachedsNode.alreadyOpenNext = true;
            } else {
                cc.log("密码错误")
                G_Event.emit("Show_Tips", "密码错误")
                this.cachedsNode.alreadyOpenNext = false;
            }

        }, this)
    }


    ClosePop() {
        this.node.removeFromParent()
        this.node.destroy()
        this.destroy()
    }

    InitPopViewByInfo(info: OneInfo, sNode?: OneSlot) {
        this.cachedInfo = info;

        if (sNode) {
            this.cachedsNode = sNode;
        }
    }

}
