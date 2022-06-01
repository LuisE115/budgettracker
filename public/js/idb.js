let db;
//open db
const request = indexedDB.open('budget', 1);

request.onupgradeneeded = (event) => {
    const db = event.target.result;

    db.createObjectStore('offlinetrans', {
        keyPath: 'id',
        autoIncrement: true

    })
}
// if success call offlinetransactions function
request.onsuccess = (event) => {
    const db = event.target.result;

    if (navigator.online) {
        offlineTransactions();
    }
}
// if error log it
request.onerror = (err) => {
    console.log(err)
}
// function called in index.js to record into the offline db
function saveRecord(record) {
    const trans = db.transaction('pending', 'readwrite')
    const store = trans.objectStore('pending')
    
    store.add(record)
}
//handle offline transacion
function  offlineTransactions() {
    const trans = db.transaction('offlinetrans', 'readwrite')
    const store = trans.objectStore('offlinetrans')

    const getAll = store.getAll();

    getRecords.onsuccess = () => {
        if (getAll.result.length > 0) {
            fetch('api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                response.json()
            })
            .then(() => {
                const trans = db.transaction('offlinetrans', 'readwrite')
                const store = trans.objectStore('offlinetrans')
                store.clear();
            })
        }
    }
}
// event listener for the window when being online
window.addEventListener('online', offlineTransactions);