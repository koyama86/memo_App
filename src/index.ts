import { readLocalStorage, saveLocalStorage, STORAGE_KEY } from "./storege";
import { Memo } from "./types";
import { marked } from "marked";

// -----------------------------------
const memoList = document.getElementById("list") as HTMLDivElement;
const addButton = document.getElementById("add") as HTMLButtonElement;
const editButton = document.getElementById("edit") as HTMLButtonElement;
const saveButton = document.getElementById("save") as HTMLButtonElement;
const deleteButton = document.getElementById("delete") as HTMLButtonElement;

const memoTitle = document.getElementById("memoTitle") as HTMLInputElement;
const memoBody = document.getElementById("memoBody") as HTMLTextAreaElement;
const previewBody = document.getElementById("previewBody") as HTMLDivElement;

const downloadLink = document.getElementById("download") as HTMLAnchorElement;



// 型定義一覧-----------------------------------
let memos: Memo[] = []
let memoIndex: number = 0;

downloadLink.addEventListener("click", clickDownLoadMemo);
deleteButton.addEventListener("click", clickDeleteMemo);
addButton.addEventListener("click", clickAddMemo);
editButton.addEventListener("click", clickEditMemo);
saveButton.addEventListener("click", clickSaveMemo);


init();

// 関数一覧-----------------------------------
function setEditMode(editMode: boolean) {
    if (editMode) {
        memoTitle.removeAttribute("disabled");
        memoBody.removeAttribute("disabled");
        memoBody.removeAttribute("hidden");
        previewBody.setAttribute("hidden", "hidden");

    } else {
        memoTitle.setAttribute("disabled", "disabled");
        memoBody.setAttribute("disabled", "disabled");
        memoBody.setAttribute("hidden", "hidden");
        previewBody.removeAttribute("hidden");
    }
}

function clickEditMemo(event: MouseEvent) {
    setEditMode(true);
    setHiddenBotton(saveButton, true);
    setHiddenBotton(saveButton, false);
}

function setMemoElement() {
    const memo: Memo = memos[memoIndex];
    memoTitle.value = memo.title;
    memoBody.value = memo.body;

    (async () => {
        try {
            previewBody.innerHTML = await marked.parse(memo.body)
        }
        catch (error) {
            console.error("error");

        }
    })();


}
function clickSaveMemo(event: MouseEvent) {
    const memo: Memo = memos[memoIndex];
    memo.title = memoTitle.value;
    memo.body = memoBody.value;
    memo.updatedAt = Date.now();
    saveLocalStorage(STORAGE_KEY, memos)
    setEditMode(false);
    setHiddenBotton(saveButton, false)
    setHiddenBotton(saveButton, false)

    showMemoElements(memoList, memos);

    setActiveStyle(memoIndex + 1, true);

    setMemoElement();

}


function setHiddenBotton(button: HTMLButtonElement, isHidden: Boolean) {
    if (isHidden) {
        memoTitle.removeAttribute("disabled");
        memoBody.removeAttribute("disabled");

    } else {
        memoTitle.removeAttribute("enabled");
        memoBody.removeAttribute("enabled");
    }
}


function newMemo(): Memo {
    const timestamp: number = Date.now();
    return {
        id: timestamp.toString() + memos.length.toString(),
        title: `new hinata ${memos.length + 1}`,
        body: "",
        createdAt: timestamp,
        updatedAt: timestamp


    }
}
function init() {
    // すべてのメモをローカルストレージから取得
    memos = readLocalStorage(STORAGE_KEY);
    console.log(memos);
    if (memos.length === 0) {
        memos.push(newMemo());
        memos.push(newMemo());
        // すべてのメモをローカルストレージに保存
        saveLocalStorage(STORAGE_KEY, memos);

    }
    console.log(memos);

    showMemoElements(memoList, memos)
    setActiveStyle(memoIndex + 1, true);

    setMemoElement();
    setHiddenBotton(saveButton, false);
    setHiddenBotton(editButton, true);


}
// メモ要素作成
function newMomeElement(memo: Memo): HTMLDivElement {
    const div = document.createElement("div");
    div.innerText = memo.title;
    div.setAttribute("data-id", memo.id);
    div.classList.add('w-full', 'p-sm');
    div.addEventListener("click", selectedMemo);
    return div;
}


function clearMemoElement(div: HTMLDivElement) {
    div.innerText = "";
}


function showMemoElements(div: HTMLDivElement, memos: Memo[]) {
    clearMemoElement(div);
    memos.forEach((memo) => {
        const memoElement = newMomeElement(memo);
        div.appendChild(memoElement);
    })

}


// function setMemoElement() {
//     const memo: Memo = memos[memoIndex];
//     memoTitle.value = memo.title;
//     memoBody.value = memo.body;
// }


function setActiveStyle(index: number, isActive: boolean) {
    const selector = `#list > div:nth-child(${index})`;
    const element =
        document.querySelector(selector) as HTMLDivElement;
    if (isActive) {
        element.classList.add('active');

    } else {
        element.classList.remove('active')
    }
}

function clickAddMemo(event: MouseEvent) {
    setEditMode(false);

    setHiddenBotton(saveButton, true);
    setHiddenBotton(editButton, false);

    memos.push(newMemo());
    saveLocalStorage(STORAGE_KEY, memos);
    memoIndex = memos.length - 1;
    showMemoElements(memoList, memos);

    setActiveStyle(memoIndex + 1, true);
    setMemoElement();
}

function selectedMemo(event: MouseEvent) {

    setEditMode(false);

    setHiddenBotton(saveButton, false);
    setHiddenBotton(editButton, true);

    setActiveStyle(memoIndex + 1, false);
    const target = event.target as HTMLDivElement;
    const id = target.getAttribute("data-id");
    memoIndex = memos.findIndex((memo) => memo.id === id);
    setMemoElement();
    setActiveStyle(memoIndex + 1, true);
}

function clickDeleteMemo(event: MouseEvent) {
    if (memos.length === 1) {
        alert("これ以上は削除できません");
        return;
    }
    const memoId = memos[memoIndex].id;
    memos = memos.filter((memo) => memo.id !== memoId);
    saveLocalStorage(STORAGE_KEY, memos);
    if (1 <= memoIndex) { memoIndex--; }
}


function clickDownLoadMemo(event: MouseEvent) {
    const memo = memos[memoIndex];
    const target = event.target as HTMLAnchorElement;
    target.download = `${memo.title}.md`;
    target.href = URL.createObjectURL(
        new Blob([memo.body], {
            type: "application/octat-stream",
        })
    );
}