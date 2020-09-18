import { ui } from "../../ui/layaMaxUI";
import gameInfo from "../comp/gameInfo";
export default class RockerControl extends ui.view.rockerUI{
    // static instance: RockerControl;
    move: boolean;
    heroMode: string;
    curTouchId: number;
    isDown: boolean;
    angle: number;
    radians: number;
    isleftControl: boolean;
    originPiont: Laya.Point;
    vectorX: number;
    vectorHitX: number;
    vectorY: number;
    deltaX: number;
    deltaY: number;
    constructor(){
        super()
    }
    onAwake(){
        // RockerControl.instance = this;
        console.log("RockerControl.instance-->",this)
        /*** 是否奔跑状态 ****/
        this.move=false;
        this.heroMode = "idle";
        /***当前多点触摸id****/
        this.curTouchId = 0;
        /***手指（鼠标）是否按下****/
        this.isDown = false;
        /***摇杆的角度****/
        this.angle = -1;
        /***摇杆的弧度****/
        this.radians = -1;
        /***是否左手遥控****/
        this.isleftControl = false;
        //鼠标按下事件监听
        Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
        //鼠标抬起事件监听
        Laya.stage.on(Laya.Event.MOUSE_UP, this, this.onMouseUp);
        //鼠标是否移除屏幕事件监听
        // this.touchRect.on(Laya.Event.MOUSE_OUT,this,this.onBlur);
        //控制器中心点位置初始化
        this.originPiont = new Laya.Point(this.width / 2, this.height / 2);
        //默认为控制器不显示
        this.visible = false;
        this.addMouseEvent();
    }
    /**恢复按钮设置 */
    addMouseEvent(){
        //鼠标按下事件监听
        Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
        //鼠标抬起事件监听
        Laya.stage.on(Laya.Event.MOUSE_UP, this, this.onMouseUp);

    }
    onMouseDown(e) {
        // console.log('mouse donw', this);
        //左右手遥控
        this.move=false;
        if (this.isleftControl) {
            //如果按下时是右边屏幕位置或已经按下鼠标，则返回
            if (e.stageX > 300 || this.isDown) return;
        }
        else {
            //如果按下时是左边屏幕位置或已经按下鼠标，则返回
            if (e.stageX < 0 || this.isDown) return;
        }
        //记录当前按下id
        this.curTouchId = e.touchId;
        //已按下
        this.isDown = true;
        //更新摇杆到屏幕按下位置
        this.pos(Laya.stage.mouseX - (this.width / 2), Laya.stage.mouseY - (this.height / 2));
        //初始化摇杆控制点位置
        this.knob.pos(this.width / 2, this.height / 2);
        //按下后显示摇杆
        this.visible = true;
        //摇杆移动控制事件监听
        Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.onMove);
    }
    onMouseUp(e) {
        // console.log('mouse up');
        //如果不是上次的点击id，返回（避免多点抬起，以第一次按下id为准）
       
        if (e.touchId != this.curTouchId) return; 
        this.heroMode = "idle"
        Laya.stage.event("MODETYPE",this.heroMode)
        this.isDown = false;
        this.visible = false;
        //移除摇杆移动事件监听
        Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.onMove);
        //修改摇杆角度与弧度为-1（代表无角度）
        this.radians = this.angle = -1;
        this.vectorX = 0;
        this.vectorHitX = 1;
        this.vectorY = 0;
    }
    onMove(e) {
        //如果不是上次的点击id，返回（避免多点抬起，以第一次按下id为准）
        if (e.touchId != this.curTouchId) return;
        //将移动时的鼠标屏幕坐标转化为摇杆局部坐标
        var locationPos = this.globalToLocal(new Laya.Point(Laya.stage.mouseX, Laya.stage.mouseY), false);
        //更新摇杆控制点位置
        this.knob.pos(locationPos.x, locationPos.y);
        //更新控制点与摇杆中心点位置距离
        this.deltaX = locationPos.x - this.originPiont.x;
        this.deltaY = locationPos.y - this.originPiont.y;
        //计算控制点在摇杆中的角度
        var dx = this.deltaX * this.deltaX;
        var dy = this.deltaY * this.deltaY;
        this.angle = Math.atan2(this.deltaX, this.deltaY) * 180 / Math.PI;
        if (this.angle < 0) this.angle += 360;
        //对角度取整
        this.angle = Math.round(this.angle);
        //计算控制点在摇杆中的弧度
        this.radians = Math.PI / 180 * this.angle;
        //强制控制点与中心距离不超过80像素
        if (dx + dy >= 80 * 80) {
            //控制点在半径为80像素的位置（根据弧度变化）
            var x = Math.floor(Math.sin(this.radians) * 80 + this.originPiont.x);
            var y = Math.floor(Math.cos(this.radians) * 80 + this.originPiont.y);
            this.knob.pos(x, y);
        }
        else {
            //不超过80像素取原坐标
            this.knob.pos(locationPos.x, locationPos.y);
        }
        gameInfo.Angle = this.angle;
        this.getVerst(this.angle)
        if(!this.move){
            this.heroMode = "pao";
            Laya.stage.event("MODETYPE",this.heroMode)
        }
        this.move=true;
        // this.getRemoteControlVlaue.call(this.heroParent,this.radians)
        // console.log("摇杆向量：",this.radians)
    }
    getVerst(angle) {
        this.vectorX = this.vectorY = 0;
        if ((angle >= 0 && angle < 22.5) || (angle > 337.5 && angle <= 360)) {
            //下
            this.vectorX = 0;
            this.vectorY = 7.5/10;
            return "下"
        }
        if (angle >= 22.5 && angle < 67.5) { //右下
            this.vectorX = 6/10;
            this.vectorY = 6/10;
            return "右下"
        }
        if (angle >= 67.5 && angle < 112.5) { //右
            this.vectorHitX = this.vectorX = 1;
            this.vectorY = 0;
            return "右"
        }
        if (angle >= 112.5 && angle < 157.5) { //右上
            this.vectorX = 6/10;
            this.vectorY = -6/10;
            return "右上"
        }
        if (angle >= 157.5 && angle < 202.5) { //上
            this.vectorX = 0;
            this.vectorY = -7.5/10;
            return "上"
        }
        if (angle >= 202.5 && angle < 247.5) { //左上
            this.vectorX = -6/10;
            this.vectorY = -6/10;
            return "左上"
        }
        if (angle >= 247.5 && angle < 292.5) { //左
            this.vectorX =this.vectorHitX= -1;
            this.vectorY = 0;
            return "左"
        }
        if (angle >= 292.5 && angle < 337.5) { //左下
            this.vectorX = -6/10;
            this.vectorY = 6/10;
            return "左下"
        }
    }
    /**隐藏时移动事件监听 */
    onDisable() {
        this.offEvent()
    }
    offEvent(){

        //鼠标按下事件监听
        Laya.stage.off(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
        //鼠标抬起事件监听
        Laya.stage.off(Laya.Event.MOUSE_UP, this, this.onMouseUp);
    }
}