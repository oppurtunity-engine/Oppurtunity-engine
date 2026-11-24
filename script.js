
const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQhGKdL3Um0WTH5_TWp-6knxo5KsoGGwDcP5xQzz-tOtn-WXQqQI9926FJyJfuw2SZ7d_W30k3iK67d/pub?gid=0&single=true&output=csv";

const universitySheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTtE6U-DJe3ZzNW6rIIZF-mQMeDIHPwi8opoaGa8EojRCNRhhRoqU0p7flaMScEpj20rEOFFuRzH-Sv/pub?gid=0&single=true&output=csv";

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

function populateFilter(select, values) {
    const unique = [...new Set(values.filter(Boolean))].sort();

    unique.forEach(value => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
    });
}

function createCard(name, details, url, className, linkText) {
    const card = document.createElement("article");
    card.className = className;

    const title = document.createElement("h3");
    title.textContent = name;
    card.appendChild(title);

    details.forEach(detail => {
        const p = document.createElement("p");
        p.textContent = detail;
        card.appendChild(p);
    });

    if (/^https?:\/\//i.test(url)) {
        const link = document.createElement("a");
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = linkText;
        card.appendChild(link);
    }

    return card;
}

async function initOpportunities() {
    const search = document.getElementById("search");
    const list = document.getElementById("opportunity-list");
    const category = document.getElementById("category-filter");
    const funding = document.getElementById("funding-filter");
    const age = document.getElementById("age-filter");
    const status = document.getElementById("status-filter");
    const reset = document.getElementById("reset-filters");
    const count = document.getElementById("result-count");

    let opportunities = [];

    function display() {
        const term = search.value.toLowerCase().trim();

        const filtered = opportunities.filter(item => {
            const matchesSearch = Object.values(item)
                .join(" ").toLowerCase().includes(term);

            const minKnown = /^\d+$/.test(item.minAge);
            const maxKnown = /^\d+$/.test(item.maxAge);

            const matchesAge = !age.value || (
                (/^no minimum$/i.test(item.minAge) ||
                (minKnown && Number(age.value) >= Number(item.minAge))) &&
                (/^no maximum$/i.test(item.maxAge) ||
                (maxKnown && Number(age.value) <= Number(item.maxAge)))
            );

            return matchesSearch &&
                (!category.value || item.category === category.value) &&
                (!funding.value || item.funding === funding.value) &&
                (!status.value || item.status === status.value) &&
                matchesAge;
        });

        list.replaceChildren();

        count.textContent =
            `Showing ${filtered.length} of ${opportunities.length} opportunities`;

        if (!filtered.length) {
            list.textContent = "No matching opportunities found.";
        }

        filtered.forEach(item => {
            list.appendChild(createCard(
                item.name,
                [
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
                ],
                item.link,
                "opportunity-card",
                "Visit Official Website"
            ));
        });
    }

    try {
        list.textContent = "Loading opportunities...";

        const response = await fetch(sheetURL);
        if (!response.ok) throw new Error("Spreadsheet unavailable");

        const rows = parseCSV(await response.text());

        opportunities = rows.slice(1)
            .filter(row => row[0]?.trim())
            .map(row => ({
                name: row[0],
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
                status: row[11]?.trim() || "Not specified",
                verified: row[12] || "Pending verification"
            }));

        populateFilter(category, opportunities.map(x => x.category));
        populateFilter(funding, opportunities.map(x => x.funding));
        populateFilter(status, opportunities.map(x => x.status));

        search.addEventListener("input", display);

        [category, funding, age, status].forEach(filter => {
            filter.addEventListener("change", display);
        });

        reset.addEventListener("click", () => {
            search.value = "";
            category.value = "";
            funding.value = "";
            age.value = "";
            status.value = "";
            display();
        });

        display();

    } catch (error) {
        list.textContent = "Unable to load opportunities.";
        console.error(error);
    }
}

async function initUniversities() {
    const search = document.getElementById("university-search");
    const list = document.getElementById("university-list");
    const country = document.getElementById("country-filter");
    const type = document.getElementById("university-type-filter");
    const count = document.getElementById("university-count");
    const reset = document.getElementById("reset-university-filters");

    let universities = [];

    function display() {
        const term = search.value.toLowerCase().trim();

        const filtered = universities.filter(uni =>
            Object.values(uni).join(" ").toLowerCase().includes(term) &&
            (!country.value || uni.country === country.value) &&
            (!type.value || uni.type === type.value)
        );

        list.replaceChildren();

        count.textContent =
            `Showing ${filtered.length} of ${universities.length} universities`;

        if (!filtered.length) {
            list.textContent = universities.length
                ? "No matching universities found."
                : "University database coming soon.";
        }

        filtered.forEach(uni => {
            list.appendChild(createCard(
                uni.name,
                [
                    "World ranking: " + uni.ranking,
                    "Ranking year: " + uni.rankingYear,
                    "Ranking source: " + uni.rankingSource,
                    "Country: " + uni.country,
                    "City: " + uni.city,
                    "University type: " + uni.type,
                    "Popular degrees: " + uni.degrees,
                    "O-Level requirements: " + uni.olevel,
                    "A-Level requirements: " + uni.alevel,
                    "Competitive academic profile: " + uni.academic,
                    "SAT/ACT: " + uni.sat,
                    "English language requirements: " + uni.english,
                    "Extracurricular expectations: " + uni.extracurriculars,
                    "Annual tuition: " + uni.tuition,
                    "Financial aid: " + uni.aid,
                    "International eligibility: " + uni.eligibility,
                    "Application fee: " + uni.fee,
                    "Application deadline: " + uni.deadline,
                    "Application platform: " + uni.platform,
                    uni.description,
                    "Last verified: " + uni.verified
                ],
                uni.link,
                "university-card",
                "Visit Official Admissions Website"
            ));
        });
    }

    try {
        list.textContent = "Loading universities...";

        const response = await fetch(universitySheetURL);
        if (!response.ok) throw new Error("Spreadsheet unavailable");

        const rows = parseCSV(await response.text());

        universities = rows.slice(1)
            .filter(row => row[0]?.trim())
            .map(row => ({
                name: row[0],
                country: row[1]?.trim() || "Not specified",
                city: row[2] || "Not specified",
                type: row[3]?.trim() || "Not specified",
                degrees: row[4] || "Not specified",
                olevel: row[5] || "Check official requirements",
                alevel: row[6] || "Check official requirements",
                academic: row[7] || "Not specified",
                sat: row[8] || "Check official requirements",
                english: row[9] || "Check official requirements",
                extracurriculars: row[10] || "Not specified",
                tuition: row[11] || "Check official website",
                aid: row[12] || "Check official website",
                eligibility: row[13] || "Check official website",
                fee: row[14] || "Check official website",
                deadline: row[15] || "Check official website",
                platform: row[16] || "Not specified",
                link: row[17] || "",
                description: row[18] || "",
                verified: row[19] || "Pending verification",
                ranking: row[20]?.trim() || "Pending verification",
                rankingYear: row[21] || "Not specified",
                rankingSource: row[22] || "Not specified"
            }));

        function rankValue(value) {
            const match = value.match(/^=?\s*(\d+)/);
            return match ? Number(match[1]) : Infinity;
        }

        universities.sort((a, b) =>
            rankValue(a.ranking) - rankValue(b.ranking)
        );

        populateFilter(country, universities.map(x => x.country));
        populateFilter(type, universities.map(x => x.type));

        search.addEventListener("input", display);
        country.addEventListener("change", display);
        type.addEventListener("change", display);

        reset.addEventListener("click", () => {
            search.value = "";
            country.value = "";
            type.value = "";
            display();
        });

        display();

    } catch (error) {
        list.textContent = "Unable to load university database.";
        console.error(error);
    }
}

initOpportunities();
initUniversities();
