class EntryManager {
    constructor() {
        $('#start-free').on('click', (event) => this.startFree());
        $('#start-set').on('click', (event) => this.startSet());
    }

    startFree() {
    }

    startSet() {
        if (document.start.group_id.value != "") {
            document.start.submit();
        } else {
            alert("セット名を入力してください");
        }
    }
}

window.onload = function() {
    new EntryManager();
}
