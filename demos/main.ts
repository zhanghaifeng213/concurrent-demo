import './style.css'
const button = document.querySelector("button")
const root = document.querySelector("#root")

interface Work {
    count: number; // 代表某一个工作要执行的次数，类比React中组件的数量。render阶段要做的是每个组件的beginWork和completeWork，如果将beginWork和completeWork类比于一个工作的话，组件数量有多少，那么这个工作就会执行多少次
}

const workList: Work[] = [];

// 2、调度阶段微任务调度（ensureRootIsScheduled方法）
function schedule() {
    const curWork = workList.pop()
    if(curWork) {
        perform(curWork)
    }
}
// 3、render阶段
// 类比beginWork和completeWork流程
function perform(work: Work) {
    while(work.count) {
        work.count--
        insertSpan('0')
    }
    schedule()
}
// 4、commit阶段
function insertSpan(content) {
    const span = document.createElement('span')
    span.innerText = content
    root?.appendChild(span)
}

// 1、交互触发更新
button && (button.onclick = () => {
    workList.unshift({
        count: 100
    })
    schedule()
})