const JSONBIN_CONFIG = {
    URL: "https://api.jsonbin.io/v3/b/677e41bfe41b4d34e471c5be",//677e99edad19ca34f8e7b623 for an already tested group and see how the o/p looks like
    KEY: "$2a$10$eaLfBzS96u7D/mrTuyOiqOEkAFr6nLwT2OPGfu99Lj9uzvLGq0GKS",
    TEST_GROUP_ID: sessionStorage.getItem("groupID")// test_group_123 for an already tested group and how the o/p looks like
};

async function fetchGroupData() {
    try {
        const response = await fetch(JSONBIN_CONFIG.URL, {
            method: "GET",
            headers: {
                "X-Master-Key": JSONBIN_CONFIG.KEY,
                "X-Bin-Meta": "false"
            }
        });

        if (!response.ok) throw new Error("Failed to fetch data");
        const data = await response.json();
        return data[JSONBIN_CONFIG.TEST_GROUP_ID].group_info;
    } catch (error) {
        console.error("Error:", error);
        alert("Error loading results. Please try again.");
    }
}

function calculateResults(groupData) {
    console.log(groupData);
    const results = [];
    
    // Calculate total amount using totalAmount
    const totalAmount = groupData.bill_inputs
        ? Object.values(groupData.bill_inputs).reduce((sum, user) => sum + (user.totalAmount || 0), 0)
        : 0;

    // Calculate total paid using amountPaid
    const totalPaid = groupData.bill_inputs
        ? Object.values(groupData.bill_inputs).reduce((sum, user) => sum + (user.amountPaid || 0), 0)
        : 0;

    // Calculate the equal share for each member
    const equalShare = totalAmount / groupData.number_of_members;

    // Calculate the lump balance for the group
    const groupBalanceLump = totalPaid - totalAmount;

    // Loop through each user's bill input to calculate results
    Object.entries(groupData.bill_inputs || {}).forEach(([userId, userBill]) => {
        const totalOwed = groupData.final_split_method === "equal"
            ? equalShare
            : userBill.totalAmount || 0;
        
        const netPosition = (userBill.amountPaid || 0) - totalOwed;

        results.push({
            userId,
            totalOwed,
            amountPaid: userBill.amountPaid || 0,
            netPosition,
        });
    });

    return { results, totalAmount, totalPaid, groupBalanceLump };
}

function displayResults(results, totalAmount, totalPaid, groupBalanceLump) {
    const tableBody = document.getElementById("resultsTableBody");
    tableBody.innerHTML = results.map(result => `
        <tr>
            <td>${result.userId}</td>
            <td>¥${result.totalOwed.toFixed(2)}</td>
            <td>¥${result.amountPaid.toFixed(2)}</td>
            <td class="${result.netPosition < 0 ? "highlight-red" : "highlight-green"}">
                ${result.netPosition >= 0 ? "+" : ""}¥${result.netPosition.toFixed(2)}
            </td>
        </tr>
    `).join("");

    const summaryDetails = document.getElementById("summaryDetails");
    summaryDetails.innerHTML = `
        <p>Total Bill: ¥${totalAmount.toFixed(2)}</p>
        <p>Total Paid: ¥${totalPaid.toFixed(2)}</p>
        <p>${groupBalanceLump > 0 ? `Restaurant owes the group: ¥${groupBalanceLump.toFixed(2)}` : `Group owes the restaurant: ¥${Math.abs(groupBalanceLump).toFixed(2)}`}</p>
    `;
}

async function initializeResults() {
    const groupData = await fetchGroupData();
    if (!groupData) return;

    const { results, totalAmount, totalPaid, groupBalanceLump } = calculateResults(groupData);
    displayResults(results, totalAmount, totalPaid, groupBalanceLump);
}

window.onload = initializeResults;