import { 
    unstable_ImmediatePriority as ImmediatePriority,
    unstable_UserBlockingPriority as UserBlockingPriority,
    unstable_NormalPriority as NormalPriority,
    unstable_LowPriority as LowPriority,
    unstable_IdlePriority as IdlePriority,
    unstable_scheduleCallback as scheduleCallback,
    unstable_shouldYield as shouldYield,
    CallbackNode,
    unstable_getFirstCallbackNode as getFirstCallbackNode,
    unstable_cancelCallback as cancelCallback
} from 'scheduler'

import './style.css'
const button = document.querySelector("button")
const root = document.querySelector("#root")

type Priority = 
    | typeof IdlePriority 
    | typeof LowPriority 
    | typeof NormalPriority 
    | typeof UserBlockingPriority 
    | typeof ImmediatePriority
interface Work {
    count: number; // 代表某一个工作要执行的次数，类比React中组件的数量。render阶段要做的是每个组件的beginWork和completeWork，如果将beginWork和completeWork类比于一个工作的话，组件数量有多少，那么这个工作就会执行多少次
    priority: Priority
}

const workList: Work[] = [];
let prevPriority: Priority = IdlePriority;
let curCallback: CallbackNode | null = null;

[LowPriority, NormalPriority, UserBlockingPriority, ImmediatePriority].forEach(priority => {
    const btn = document.createElement('button')
    root?.appendChild(btn)
    btn.innerText = ['', 'ImmediatePriority', 'UserBlockingPriority', 'NormalPriority', 'LowPriority'][priority];
    btn.onclick = () => {
        workList.unshift({
            count: 100,
            priority: priority as Priority
        })
        schedule()
    }
})


// 2、调度阶段微任务调度（ensureRootIsScheduled方法）
function schedule() {
    const cbNode = getFirstCallbackNode()
    const curWork = workList.sort((w1, w2) => w1.priority - w2.priority)[0]
    // 策略逻辑
    if(!curWork) {
        curCallback = null;
        cbNode && cancelCallback(cbNode);
        return
    }
    const { priority: curPriority } = curWork
    if(curPriority === prevPriority) {
        return
    }
    cbNode && cancelCallback(cbNode);
    curCallback = scheduleCallback(curPriority, perform.bind(null, curWork))
    // if(curWork) {
    //     perform(curWork)
    // }
}
// 3、render阶段
// 类比beginWork和completeWork流程
// 当前work有没有过期，过期了就要同步执行
function perform(work: Work, didTimeout?: boolean) {
    /**
     * 1. work.priority
     * 2. 饥饿问题
     * 3. 时间切片
     */
    const needSync = work.priority === ImmediatePriority || didTimeout
    // shouldYield() 时间切片用尽
    while((needSync || !shouldYield()) && work.count) {
        work.count--;
        insertSpan(work.priority + '');
    }
    // 中断执行 || 执行完
    prevPriority = work.priority
    if(!work.count) {
        const workIndex = workList.indexOf(work)
        workList.splice(workIndex, 1)
        prevPriority = IdlePriority
    }

    const prevCallback = curCallback;
    schedule()
    const newCallback = curCallback;
    if(newCallback && prevCallback === newCallback) {
        return perform.bind(null, work)
    }
}
// 4、commit阶段
function insertSpan(content) {
    const span = document.createElement('span')
    span.innerText = content
    span.className = `pri-${content}`
    doSomeBuzyWork(10000000)
    root?.appendChild(span)
}

function doSomeBuzyWork(len: number) {
    let result = 0;
    while(len--) {
        result+=len
    }
}

// 1、交互触发更新
// button && (button.onclick = () => {
//     workList.unshift({
//         count: 100
//     })
//     schedule()
// })