const lr = ['left', 'right']
const lrdu = ['left', 'right', 'down', 'up']
const dulrb = ['downBig', 'upBig', 'leftBig', 'rightBig']
const tlbrtrbl = ['topLeft', 'bottomRight', 'topRight', 'bottomLeft']
const dlurdrul = ['downLeft', 'upRight', 'downRight', 'upLeft']

// animate.css 配置
const ANIMATE = {
  preset: [ // 预设动画配置
    { name: 'back', alias: '渐近', directions: lrdu },
    { name: 'bounce', alias: '弹跳', directions: lrdu.concat('default') },
    { name: 'fade', alias: '淡化', directions: lrdu.concat(dulrb).concat(tlbrtrbl).concat('default') },
    { name: 'flip', alias: '翻转', directions: ['x', 'y'] },
    { name: 'lightSpeed', alias: '光速', directions: lr },
    { name: 'rotate', alias: '旋转', directions: dlurdrul.concat('default') },
    { name: 'roll', alias: '翻滚', directions: ['default'] },
    { name: 'zoom', alias: '缩放', directions: lrdu.concat('default') },
    { name: 'slide', alias: '滑动', directions: lrdu }
  ]
}
module.exports = ANIMATE
