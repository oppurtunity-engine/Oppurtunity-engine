
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



const universitySheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTtE6U-DJe3ZzNW6rIIZF-mQMeDIHPwi8opoaGa8EojRCNRhhRoqU0p7flaMScEpj20rEOFFuRzH-Sv/pub?gid=0&single=true&output=csv";

const universitySearch = document.getElementById("university-search");
const universityList = document.getElementById("university-list");
const countryFilter = document.getElementById("country-filter");
const universityTypeFilter = document.getElementById("university-type-filter");
const universityCount = document.getElementById("university-count");
const resetUniversityFilters = document.getElementById("reset-university-filters");

let universities = [];

function displayUniversities(items) {
    universityList.replaceChildren();

    universityCount.textContent =
        `Showing ${items.length} of ${universities.length} universities`;

    if (items.length === 0) {
        universityList.textContent = universities.length === 0
            ? "University database coming soon."
            : "No matching universities found.";
        return;
    }

    items.forEach(uni => {
        const card = document.createElement("article");
        card.className = "university-card";

        const title = document.createElement("h3");
        title.textContent = uni.name;
        card.appendChild(title);

        const details = [
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
        ];

        details.forEach(detail => {
            const p = document.createElement("p");
            p.textContent = detail;
            card.appendChild(p);
        });

        if (/^https?:\/\//i.test(uni.link)) {
            const link = document.createElement("a");
            link.href = uni.link;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.textContent = "Visit Official Admissions Website";
            card.appendChild(link);
        }

        universityList.appendChild(card);
    });
}

function filterUniversities() {
    const term = universitySearch.value.toLowerCase().trim();
    const country = countryFilter.value;
    const type = universityTypeFilter.value;

    const filtered = universities.filter(uni => {
        return Object.values(uni).join(" ").toLowerCase().includes(term)
            && (!country || uni.country === country)
            && (!type || uni.type === type);
    });

    displayUniversities(filtered);
}

async function loadUniversities() {
    universityList.textContent = "Loading universities...";

    try {
        const response = await fetch(universitySheetURL);

        if (!response.ok) {
            throw new Error("Unable to load university database");
        }

        const csv = await response.text();
        const rows = parseCSV(csv);

        universities = rows.slice(1)
            .filter(row => row[0]?.trim())
            .map(row => ({
                name: row[0] || "",
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
                verified: row[19] || "Pending verification"
            }));

        const countries = [...new Set(
            universities.map(uni => uni.country)
        )].sort();

        countries.forEach(country => {
            const option = document.createElement("option");
            option.value = country;
            option.textContent = country;
            countryFilter.appendChild(option);
        });

        const types = [...new Set(
            universities.map(uni => uni.type)
        )].sort();

        types.forEach(type => {
            const option = document.createElement("option");
            option.value = type;
            option.textContent = type;
            universityTypeFilter.appendChild(option);
        });

        filterUniversities();

    } catch (error) {
        universityList.textContent =
            "Unable to load university database. Please try again later.";
        console.error(error);
    }
}

universitySearch.addEventListener("input", filterUniversities);
countryFilter.addEventListener("change", filterUniversities);
universityTypeFilter.addEventListener("change", filterUniversities);

resetUniversityFilters.addEventListener("click", () => {
    universitySearch.value = "";
    countryFilter.value = "";
    universityTypeFilter.value = "";
    filterUniversities();
});

loadUniversities();
