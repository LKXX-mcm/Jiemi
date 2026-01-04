import { G_DEATH_LEVEL_ID, G_Event, G_NEXT_LEVEL_ID, G_SUCCESS_ESC, G_Z_INDEX } from "./GloabData";
import LineNode from "./LineNode";
import OneSlot from "./OneSlotNode";
import PopViewNode from "./PopViewNode";

const { ccclass, property } = cc._decorator;

export let InfoType = {
    Room: "room",
    Device: "device",
    Item: "item",
}

export interface OneInfo {
    type: string,
    id: number,
    name: string,
    from: number[],
    to: number[],
    lockid: number,
    keyid: number,
    passw: string,
    des: string,
    position: number[],
    scale: number
}



@ccclass
export default class GameMain extends cc.Component {

    @property(cc.JsonAsset)
    levelConfig: cc.JsonAsset = null;

    @property(cc.Button)
    btnStart: cc.Button = null;
    @property(cc.Node)
    nodeMenu: cc.Node = null;
    @property(cc.Node)
    resultNode: cc.Node = null;
    @property(cc.Label)
    labelResLabel: cc.Label = null;

    @property(cc.Node)
    nodeRoot: cc.Node = null;
    @property(cc.Label)
    labelDes: cc.Label = null;

    @property(cc.Node)
    nodeTips: cc.Node = null;
    @property(cc.Label)
    labelTips: cc.Label = null;

    @property(cc.Prefab)
    prefabSlot: cc.Prefab = null;
    @property(cc.Prefab)
    prefabPop: cc.Prefab = null;
    @property(cc.Prefab)
    prefabLineNode: cc.Prefab = null;

    slotNodeArr: cc.Node[] = []
    lineNodeArr: LineNode[] = []
    curLevelArr: OneInfo[] = []


    nLevel: number = 1

    protected onLoad(): void {
        this.slotNodeArr = []
        let level = cc.sys.localStorage.getItem("SaveLevel")
        if (!level || !Number(level)) {
            level = 1;
        }
        this.nLevel = Number(level)
    }

    start() {

        let levelArr: OneInfo[] = this.levelConfig.json["level" + this.nLevel]
        this.curLevelArr = levelArr
        cc.log("=>>>>>>>", levelArr)
        this.InitLevelByInfo(levelArr)

        this.resultNode.active = false;
        this.nodeMenu.active = true;
        this.btnStart.node.on("click", () => {
            this.nodeMenu.active = false;
        }, this)

        G_Event.on("Open_One_Slot", this.OpenOneSlot, this)
        G_Event.on("Show_Slot_Des", this.ShowSlotDes, this)
        G_Event.on("Show_Tips", this.ShowTips, this)
        G_Event.on("Show_Pop_View", this.ShowPopView, this)
        G_Event.on("Hide_One_Slot", this.HideOneSlot, this)
        G_Event.on("Update_All_Line_node", this.UpdateAllLinenode, this)
    }

    ShowPopView(info: OneInfo, sNode?: OneSlot) {
        let popNode = cc.instantiate(this.prefabPop)
        popNode.getComponent(PopViewNode).InitPopViewByInfo(info, sNode)
        this.nodeRoot.addChild(popNode, 999)
        popNode.position = cc.v3(0, 0)

    }


    ShowSlotDes(strDes: string) {
        this.labelDes.string = strDes
    }

    ShowTips(strTips: string) {
        this.nodeTips.active = true;
        this.nodeTips.opacity = 255;
        this.labelTips.string = strTips;

        cc.tween(this.nodeTips)
            .delay(2)
            .to(0.3, { opacity: 0 })
            .call(() => {
                this.nodeTips.active = false;
            })
            .start()
    }

    OpenOneSlot(sendInfo: OneInfo, levelArr?: OneInfo[]) {
        if (!levelArr) {
            levelArr = this.curLevelArr
        }

        this.labelDes.string = sendInfo.des
        let toIDArr = sendInfo.to
        cc.log("=OpenOneSlot===>>", toIDArr)
        if (toIDArr.indexOf(G_NEXT_LEVEL_ID) >= 0) {
            // G_Event.emit("Show_Tips", "恭喜你离开了这里")
            this.resultNode.active = true;
            this.labelResLabel.string = "逃离成功,进入下一场景"
            this.ClearAllSlots()
            cc.tween(this.resultNode)
                .delay(2)
                .call(() => {
                    this.resultNode.active = false;
                    this.GotoNextLevel()
                })
                .start()
            return;
        }
        if (toIDArr.indexOf(G_DEATH_LEVEL_ID) >= 0) {
            this.resultNode.active = true;
            this.labelResLabel.string = "逃离失败!!!!!"
            this.ClearAllSlots()

            cc.tween(this.resultNode)
                .delay(2)
                .call(() => {
                    this.resultNode.active = false;
                    this.nodeMenu.active = true;
                    this.GotoNewLevel()
                })
                .start()
            return
        }
        if (toIDArr.indexOf(G_SUCCESS_ESC) >= 0) {
            this.resultNode.active = true;
            this.labelResLabel.string = "恭喜你离开了房子"
            this.ClearAllSlots()

            cc.tween(this.resultNode)
                .delay(2)
                .call(() => {
                    this.resultNode.active = false;
                    this.nodeMenu.active = true;
                    this.GotoNewLevel()
                })
                .start()
            return
        }
        for (let i = 0; i < toIDArr.length; i++) {
            for (let j = 0; j < levelArr.length; j++) {
                if (levelArr[j].id == toIDArr[i]) {
                    this.CreateOneSlotNode(levelArr[j], sendInfo)
                    break;
                }
            }
        }
    }

    InitLevelByInfo(levelArr: OneInfo[]) {
        for (let oneItem of levelArr) {
            if (oneItem.from.length == 0 && oneItem.type == InfoType.Room) {
                this.CreateOneSlotNode(oneItem, null)
                this.labelDes.string = oneItem.des
            }
        }
    }


    CreateOneSlotNode(info: OneInfo, sendInfo: OneInfo) {
        let oneSlot = cc.instantiate(this.prefabSlot)
        oneSlot.getComponent(OneSlot).InitByInfo(info, this)
        this.nodeRoot.addChild(oneSlot, G_Z_INDEX.nSlotZ)
        oneSlot.position = cc.v3(info.position[0], info.position[1])
        oneSlot.scale = info.scale
        this.slotNodeArr.push(oneSlot)
        // cc.log("=qppppppppppppppweq", sendInfo)
        if (sendInfo) {
            this.CreateOneLineNode(info, sendInfo)
        }
    }

    GetSlotNodeByID(nID): cc.Node {
        for (let oneSlot of this.slotNodeArr) {
            if (cc.isValid(oneSlot) && oneSlot.getComponent(OneSlot).cachedInfo.id == nID) {
                return oneSlot
            }
        }
        console.error("=?????GetSlotNodeByID_error??????", nID)
        return null
    }

    GetOneSlotByID(id: number): OneSlot {
        for (let i = 0; i < this.slotNodeArr.length; i++) {
            let oneSlot = this.slotNodeArr[i]
            if (oneSlot.getComponent(OneSlot).cachedInfo.id == id) {
                return oneSlot.getComponent(OneSlot)
            }
        }
        return null
    }

    ClearAllSlots() {
        for (let i = 0; i < this.slotNodeArr.length; i++) {
            let nodeS = this.slotNodeArr[i]
            if (nodeS.isValid) {
                nodeS.removeFromParent()
                nodeS.destroy()
                nodeS = null;
            }
        }
        for (let i = 0; i < this.lineNodeArr.length; i++) {
            let nodeS = this.lineNodeArr[i]
            if (nodeS.node.isValid) {
                nodeS.node.removeFromParent()
                nodeS.destroy()
                nodeS = null;
            }
        }
        this.lineNodeArr = []
        this.slotNodeArr = []
    }


    GotoNextLevel() {
        this.nLevel += 1
        let levelArr: OneInfo[] = this.levelConfig.json["level" + this.nLevel]
        if (levelArr && levelArr.length > 0) {

            cc.sys.localStorage.setItem("SaveLevel", this.nLevel)

            this.curLevelArr = levelArr
            cc.log("=>>>GotoNextLevel>>>>", levelArr)
            this.InitLevelByInfo(levelArr)
        } else {
            cc.error("=?>>>>>>>>>>>>>>this.nLevel=", this.nLevel)
        }
    }


    GotoNewLevel() {
        let level = cc.sys.localStorage.getItem("SaveLevel")
        if (!level || !Number(level)) {
            level = 1;
        }
        this.nLevel = Number(level)
        let levelArr: OneInfo[] = this.levelConfig.json["level" + this.nLevel]
        if (levelArr && levelArr.length > 0) {
            this.curLevelArr = levelArr
            cc.log("=>>>GotoNextLevel>>>>", levelArr)
            this.InitLevelByInfo(levelArr)
        } else {
            cc.error("=?>>>>>>>>>>>>>>this.nLevel=", this.nLevel)
        }
    }




    CreateOneLineNode(info: OneInfo, sendInfo: OneInfo) {
        let oneLine = cc.instantiate(this.prefabLineNode)
        this.nodeRoot.addChild(oneLine, G_Z_INDEX.nLineZ)

        oneLine.position = cc.v3(sendInfo.position[0], sendInfo.position[1])

        oneLine.getComponent(LineNode).InitLineNodeByInfo(cc.v3(sendInfo.position[0], sendInfo.position[1]),
            info,
            sendInfo)

        this.lineNodeArr.push(oneLine.getComponent(LineNode))
    }

    HideOneSlot(info: OneInfo) {
        for (let i = 0; i < this.lineNodeArr.length; i++) {
            if (this.lineNodeArr[i].cacheInfo.id == info.id) {
                this.lineNodeArr[i].node.active = false;
            }
        }
    }



    //从slotInfo.id获取line,再从line.cacheInfo.id获取链接的slot位置
    UpdateAllLinenode(slotInfo: OneInfo) {
        for (let i = 0; i < this.lineNodeArr.length; i++) {
            if (cc.isValid(this.lineNodeArr[i].node) && this.lineNodeArr[i].node.active) {
                if (this.lineNodeArr[i].cacheInfoInit.id == slotInfo.id) {
                    let lineNodeCom1 = this.lineNodeArr[i]
                    let ci = lineNodeCom1.cacheInfo.id
                    let slotNodeCom = this.GetOneSlotByID(ci)

                    lineNodeCom1.ResetLineNode(cc.v3(slotInfo.position[0], slotInfo.position[1]),
                        cc.v3(slotNodeCom.node.x, slotNodeCom.node.y))

                }

                if (this.lineNodeArr[i].cacheInfo.id == slotInfo.id) {
                    let lineNodeCom2 = this.lineNodeArr[i]

                    let ci2 = lineNodeCom2.cacheInfoInit.id
                    let slotNodeCom2 = this.GetOneSlotByID(ci2)

                    lineNodeCom2.ResetLineNode(cc.v3(slotNodeCom2.node.x, slotNodeCom2.node.y),
                        cc.v3(slotInfo.position[0], slotInfo.position[1]))
                }
            }
        }
    }

}
