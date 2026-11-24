
const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQhGKdL3Um0WTH5_TWp-6knxo5KsoGGwDcP5xQzz-tOtn-WXQqQI9926FJyJfuw2SZ7d_W30k3iK67d/pub?gid=0&single=true&output=csv";

const searchInput = document.getElementById("search");
const opportunityList = document.getElementById("opportunity-list");
const categoryFilter = document.getElementById("category-filter");
const fundingFilter = document.getElementById("funding-filter");
const ageFilter = document.getElementById("age-filter");
const statusFilter = document.getElementById("status-filter");
const resetButton = document.getElementById("reset-filters");
const resultCount = document.getElementById("result-count");

let opportunities = [];

function parseCSV(text) {
    const rows = [];
    let row = [], field = "", quoted = false;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];

        if (char === '"') {
            if (quoted && text[i + 1] === '"') {
                field += '"';
                i++;
            } else {
                quoted = !quoted;
            }
        } else if (char === "," && !quoted) {
            row.push(field);
            field = "";
        } else if (char === "\n" && !quoted) {
            row.push(field);
            rows.push(row);
            row = [];
            field = "";
        } else if (char !== "\r") {
            field += char;
        }
    }

    if (field || row.length) {
        row.push(field);
        rows.push(row);
    }

    return rows;
}

function populateFilter(select, key) {
    const values = [...new Set(
        opportunities.map(item => item[key]).filter(Boolean)
    )].sort();

    values.forEach(value => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
    });
}

function displayOpportunities(items) {
    opportunityList.replaceChildren();

    resultCount.textContent =
        `Showing ${items.length} of ${opportunities.length} opportunities`;

    if (items.length === 0) {
        opportunityList.textContent = "No matching opportunities found.";
        return;
    }

    items.forEach(item => {
        const card = document.createElement("article");
        card.className = "opportunity-card";

        const title = document.createElement("h3");
        title.textContent = item.name;
        card.appendChild(title);

        const details = [
            item.category,
            "Age: " + item.minAge + " - " + item.maxAge,
            "Pakistani eligibility: " + item.eligibility,
            "Funding: " + item.funding,
            "Application fee: " + item.fee,
            "Deadline: " + item.deadline,
            "Subject: " + item.subject,
            "Status: " + item.status,
            item.description,
            "Last verified: " + item.verified
        ];

        details.forEach(detail => {
            const p = document.createElement("p");
            p.textContent = detail;
            card.appendChild(p);
        });

        if (/^https?:\/\//i.test(item.link)) {
            const link = document.createElement("a");
            link.href = item.link;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.textContent = "Visit Official Website";
            card.appendChild(link);
        }

        opportunityList.appendChild(card);
    });
}

function filterOpportunities() {
    const term = searchInput.value.toLowerCase().trim();
    const category = categoryFilter.value;
    const funding = fundingFilter.value;
    const age = ageFilter.value;
    const status = statusFilter.value;

    const filtered = opportunities.filter(item => {
        const matchesSearch = Object.values(item)
            .join(" ").toLowerCase().includes(term);

        const matchesCategory = !category || item.category === category;
        const matchesFunding = !funding || item.funding === funding;
        const matchesStatus = !status || item.status === status;

        const minKnown = /^\d+$/.test(item.minAge);
        const maxKnown = /^\d+$/.test(item.maxAge);
        const noMinimum = /^no minimum$/i.test(item.minAge);
        const noMaximum = /^no maximum$/i.test(item.maxAge);

        const matchesAge = !age || (
            (noMinimum || (minKnown && Number(age) >= Number(item.minAge))) &&
            (noMaximum || (maxKnown && Number(age) <= Number(item.maxAge)))
        );

        return matchesSearch &&
            matchesCategory &&
            matchesFunding &&
            matchesAge &&
            matchesStatus;
    });

    displayOpportunities(filtered);
}

async function loadOpportunities() {
    opportunityList.textContent = "Loading opportunities...";

    try {
        const response = await fetch(sheetURL);

        if (!response.ok) {
            throw new Error("Unable to load spreadsheet");
        }

        const csv = await response.text();
        const rows = parseCSV(csv);

        opportunities = rows.slice(1)
            .filter(row => row[0]?.trim())
            .map(row => ({
                name: row[0] || "",
                category: row[1]?.trim() || "Not specified",
                minAge: row[2]?.trim() || "Not specified",
                maxAge: row[3]?.trim() || "Not specified",
                eligibility: row[4] || "Check official rules",
                funding: row[5]?.trim() || "Not specified",
                fee: row[6] || "Not specified",
                deadline: row[7] || "Check official website",
                subject: row[8] || "Not specified",
                link: row[9] || "",
                description: row[10] || "",
                status: row[11]?.trim() || "Check official website",
                verified: row[12] || "Pending verification"
            }));

        populateFilter(categoryFilter, "category");
        populateFilter(fundingFilter, "funding");
        populateFilter(statusFilter, "status");

        filterOpportunities();

    } catch (error) {
        opportunityList.textContent =
            "Unable to load opportunities. Please try again later.";
        console.error(error);
    }
}

searchInput.addEventListener("input", filterOpportunities);
categoryFilter.addEventListener("change", filterOpportunities);
fundingFilter.addEventListener("change", filterOpportunities);
ageFilter.addEventListener("change", filterOpportunities);
statusFilter.addEventListener("change", filterOpportunities);

resetButton.addEventListener("click", () => {
    searchInput.value = "";
    categoryFilter.value = "";
    fundingFilter.value = "";
    ageFilter.value = "";
    statusFilter.value = "";
    filterOpportunities();
});

loadOpportunities();
