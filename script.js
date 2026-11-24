
const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQhGKdL3Um0WTH5_TWp-6knxo5KsoGGwDcP5xQzz-tOtn-WXQqQI9926FJyJfuw2SZ7d_W30k3iK67d/pub?gid=0&single=true&output=csv";

const searchInput = document.getElementById("search");
const opportunityList = document.getElementById("opportunity-list");

let opportunities = [];

// Read CSV data, including descriptions with commas.
function parseCSV(text) {
    const rows = [];
    let row = [];
    let field = "";
    let quoted = false;

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

// Create opportunity cards.
function displayOpportunities(items) {
    opportunityList.replaceChildren();

    if (items.length === 0) {
        opportunityList.textContent =
            "No matching opportunities found.";
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
            "Age: " + item.age,
            "Pakistani eligibility: " + item.eligibility,
            "Funding: " + item.funding,
            "Application fee: " + item.fee,
            "Deadline: " + item.deadline,
            "Status: " + item.status,
            item.description
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

// Load opportunities from Google Sheets.
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
                category: row[1] || "",
                age: (row[2] || "Not specified") +
                     " - " + (row[3] || "Not specified"),
                eligibility: row[4] || "Check official rules",
                funding: row[5] || "Not specified",
                fee: row[6] || "Not specified",
                deadline: row[7] || "Check official website",
                subject: row[8] || "",
                link: row[9] || "",
                description: row[10] || "",
                status: row[11] || "Check official website"
            }));

        filterOpportunities();

    } catch (error) {
        opportunityList.textContent =
            "Unable to load opportunities. Please try again later.";
        console.error(error);
    }
}

// Search functionality.
function filterOpportunities() {
    const term = searchInput.value.toLowerCase().trim();

    const filtered = opportunities.filter(item =>
        Object.values(item).join(" ")
            .toLowerCase().includes(term)
    );

    displayOpportunities(filtered);
}

searchInput.addEventListener("input", filterOpportunities);

loadOpportunities();
