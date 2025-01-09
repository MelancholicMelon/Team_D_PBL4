const JSONBIN_CONFIG = {
    URL: "https://api.jsonbin.io/v3/b/677e41bfe41b4d34e471c5be",
    KEY: "$2a$10$eaLfBzS96u7D/mrTuyOiqOEkAFr6nLwT2OPGfu99Lj9uzvLGq0GKS",
    TEST_GROUP_ID: sessionStorage.getItem("groupID"),//test_group_123 for an already tested group and how the o/p looks like
    TEST_USER_ID: sessionStorage.getItem("user")
};

let items = [];
let splitMethod = 'equal';
let statusInterval;

async function initialize() {
    try {
        const response = await fetch(JSONBIN_CONFIG.URL, {
            method: "GET",
            headers: {
                "X-Master-Key": JSONBIN_CONFIG.KEY,
                "X-Bin-Meta": "false"
            }
        });
        if (!response.ok) throw new Error('Failed to fetch data');

        const data = await response.json();
        console.log('Fetched data:', data);
        const groupData = data[JSONBIN_CONFIG.TEST_GROUP_ID].group_info;
        splitMethod = groupData.final_split_method || 'equal';

        document.getElementById('equalSplitForm').style.display = splitMethod === 'equal' ? 'block' : 'none';
        document.getElementById('individualSplitForm').style.display = splitMethod === 'individual' ? 'block' : 'none';
        document.getElementById('splitMethodBanner').textContent = `Split Method: ${splitMethod === 'equal' ? 'Equal Split' : 'Pay for What You Ate'}`;

        setCurrentUserBadge();
    } catch (error) {
        console.error('Error:', error);
        alert('Error loading split method. Please try again.');
    }
}

function setCurrentUserBadge() {
    const userId = JSONBIN_CONFIG.TEST_USER_ID;  // Example: "user1"
    document.getElementById('currentUserBadge').innerText = `${userId} (You)`;
}

function addItem() {
    const name = document.getElementById('itemName').value;
    const price = parseFloat(document.getElementById('itemPrice').value);

    if (!name || !price) {
        alert('Please enter both item name and price!');
        return;
    }

    items.push({ name, price });
    updateItemList();
    updateTotal();

    document.getElementById('itemName').value = '';
    document.getElementById('itemPrice').value = '';
}

function updateItemList() {
    const itemList = document.getElementById('itemList');
    itemList.innerHTML = items.map((item, index) => `
        <div class="item">
            <span>${item.name} - ¥${item.price}</span>
            <button class="remove-btn" onclick="removeItem(${index})">Remove</button>
        </div>
    `).join('');
}

function updateTotal() {
    const total = items.reduce((sum, item) => sum + item.price, 0);
    document.getElementById('runningTotal').textContent = total;
}

function removeItem(index) {
    items.splice(index, 1);
    updateItemList();
    updateTotal();
}

async function submitAndContinue() {
    const amountPaid = parseFloat(document.getElementById('amountPaid').value) || 0;
    let billData;

    if (splitMethod === 'equal') {
        const totalAmount = parseFloat(document.getElementById('totalAmount').value);
        if (!totalAmount) {
            alert('Please enter the total bill amount!');
            return;
        }
        billData = {
            totalAmount,
            amountPaid
        };
    } else {
        if (items.length === 0) {
            alert('Please add at least one item!');
            return;
        }
        billData = {
            items,
            total: items.reduce((sum, item) => sum + item.price, 0),
            amountPaid
        };
    }

    try {
        const response = await fetch(JSONBIN_CONFIG.URL, {
            method: "GET",
            headers: {
                "X-Master-Key": JSONBIN_CONFIG.KEY,
                "X-Bin-Meta": "false"
            }
        });

        if (!response.ok) throw new Error('Failed to fetch data');

        const data = await response.json();
        if (!data[JSONBIN_CONFIG.TEST_GROUP_ID].group_info.bill_inputs) {
            data[JSONBIN_CONFIG.TEST_GROUP_ID].group_info.bill_inputs = {};
        }
        data[JSONBIN_CONFIG.TEST_GROUP_ID].group_info.bill_inputs[JSONBIN_CONFIG.TEST_USER_ID] = billData;

        const updateResponse = await fetch(JSONBIN_CONFIG.URL, {
            method: "PUT",
            headers: {
                "X-Master-Key": JSONBIN_CONFIG.KEY,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (!updateResponse.ok) throw new Error('Failed to save data');

        window.location.href = 'results.html';
    } catch (error) {
        console.error('Error:', error);
        alert('Error saving data. Please try again.');
    }
}

async function updateUserStatus() {
    try {
        const response = await fetch(JSONBIN_CONFIG.URL, {
            method: "GET",
            headers: {
                "X-Master-Key": JSONBIN_CONFIG.KEY,
                "X-Bin-Meta": "false"
            }
        });

        if (!response.ok) throw new Error('Failed to fetch data');

        const data = await response.json();
        const groupData = data[JSONBIN_CONFIG.TEST_GROUP_ID].group_info;
        const billInputs = groupData.bill_inputs || {};

        const statusList = document.getElementById('userStatusList');
        statusList.innerHTML = '';

        // Iterate over each member in the group
        groupData.members.forEach((member, index) => {
            const userId = member;  // The user's ID is directly from the "members" list
            const isCurrentUser = userId === JSONBIN_CONFIG.TEST_USER_ID;
            const hasSubmitted = billInputs[userId] !== undefined;

            // Create a new status item for each member
            const statusItem = document.createElement('div');
            statusItem.className = 'user-status';
            statusItem.innerHTML = `
                <span class="status-icon">${hasSubmitted ? '✅' : '⏳'}</span>
                <span class="${isCurrentUser ? 'user-you' : ''}">
                    ${member}${isCurrentUser ? ' (You)' : ''}: 
                    ${hasSubmitted ? 'Items entered' : 'Waiting for input'}
                </span>
            `;
            statusList.appendChild(statusItem);
        });

        const totalSubmissions = Object.keys(billInputs).length;
        const continueButton = document.querySelector('button[onclick="submitAndContinue()"]');
        continueButton.disabled = totalSubmissions !== groupData.number_of_members;

        if (totalSubmissions !== groupData.number_of_members) {
            const waitingText = document.createElement('div');
            waitingText.className = 'waiting-text pulse';
            waitingText.textContent = `Waiting for ${groupData.number_of_members - totalSubmissions} more members to enter their items...`;
            statusList.appendChild(waitingText);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}
async function saveDetails() {
const amountPaid = parseFloat(document.getElementById('amountPaid').value) || 0;

let billData;
if (splitMethod === 'equal') {
const totalAmount = parseFloat(document.getElementById('totalAmount').value);
if (!totalAmount) {
    alert('Please enter the total bill amount!');
    return;
}
billData = { totalAmount, amountPaid };
} else {
if (items.length === 0) {
    alert('Please add at least one item!');
    return;
}
billData = {
    items,
    total: items.reduce((sum, item) => sum + item.price, 0),
    amountPaid,
};
}

try {
const response = await fetch(JSONBIN_CONFIG.URL, {
    method: "GET",
    headers: {
        "X-Master-Key": JSONBIN_CONFIG.KEY,
        "X-Bin-Meta": "false",
    },
});

if (!response.ok) throw new Error("Failed to fetch data");

const data = await response.json();
if (!data[JSONBIN_CONFIG.TEST_GROUP_ID].group_info.bill_inputs) {
    data[JSONBIN_CONFIG.TEST_GROUP_ID].group_info.bill_inputs = {};
}
data[JSONBIN_CONFIG.TEST_GROUP_ID].group_info.bill_inputs[JSONBIN_CONFIG.TEST_USER_ID] = billData;

const updateResponse = await fetch(JSONBIN_CONFIG.URL, {
    method: "PUT",
    headers: {
        "X-Master-Key": JSONBIN_CONFIG.KEY,
        "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
});

if (!updateResponse.ok) throw new Error("Failed to save data");

alert("Details saved! Waiting for others...");
updateUserStatus();
} catch (error) {
console.error("Error:", error);
alert("Error saving details. Please try again.");
}
}

async function updateUserStatus() {
try {
const response = await fetch(JSONBIN_CONFIG.URL, {
    method: "GET",
    headers: {
        "X-Master-Key": JSONBIN_CONFIG.KEY,
        "X-Bin-Meta": "false",
    },
});

if (!response.ok) throw new Error("Failed to fetch data");

const data = await response.json();
const groupData = data[JSONBIN_CONFIG.TEST_GROUP_ID].group_info;
const billInputs = groupData.bill_inputs || {};

const statusList = document.getElementById("userStatusList");
statusList.innerHTML = "";

// Iterate over each member in the group
groupData.members.forEach((member) => {
    const userId = member;  // The user's ID is directly from the "members" list
    const isCurrentUser = userId === JSONBIN_CONFIG.TEST_USER_ID;
    const hasSubmitted = billInputs[userId] !== undefined;

    // Create a new status item for each member
    const statusItem = document.createElement("div");
    statusItem.className = "user-status";
    statusItem.innerHTML = `
        <span class="status-icon">${hasSubmitted ? "✅" : "⏳"}</span>
        <span class="${isCurrentUser ? "user-you" : ""}">
            ${member}${isCurrentUser ? " (You)" : ""}: ${
        hasSubmitted ? "Details submitted" : "Waiting for input"
    }
        </span>
    `;
    statusList.appendChild(statusItem);
});

const totalSubmissions = Object.keys(billInputs).length;
const continueButton = document.getElementById("continueToResults");
continueButton.disabled = totalSubmissions !== groupData.number_of_members;

if (totalSubmissions !== groupData.number_of_members) {
    const waitingText = document.createElement("div");
    waitingText.className = "waiting-text pulse";
    waitingText.textContent = `Waiting for ${
        groupData.number_of_members - totalSubmissions
    } more members to enter their items...`;
    statusList.appendChild(waitingText);
}
} catch (error) {
console.error("Error:", error);
}
}

async function checkAllReady() {
const response = await fetch(JSONBIN_CONFIG.URL, {
method: "GET",
headers: {
    "X-Master-Key": JSONBIN_CONFIG.KEY,
    "X-Bin-Meta": "false",
},
});

if (!response.ok) throw new Error("Failed to fetch data");

const data = await response.json();
const groupData = data[JSONBIN_CONFIG.TEST_GROUP_ID].group_info;
return Object.keys(groupData.bill_inputs || {}).length === groupData.number_of_members;
}

window.onload = async function () {
await initialize();
await updateUserStatus();

statusInterval = setInterval(async () => {
const allReady = await checkAllReady();
if (allReady) {
    clearInterval(statusInterval);
    document.getElementById("continueToResults").disabled = false;
} else {
    await updateUserStatus();
}
}, 5000);
};
