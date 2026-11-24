
const searchInput = document.getElementById("search");
const cards = document.querySelectorAll(".opportunity-card");

const noResults = document.createElement("p");
noResults.textContent = "No matching opportunities found.";
noResults.style.display = "none";

document.getElementById("opportunity-list").after(noResults);

searchInput.addEventListener("input", function () {
    const searchTerm = searchInput.value.toLowerCase().trim();
    let matches = 0;

    cards.forEach(function (card) {
        const content = card.textContent.toLowerCase();

        if (content.includes(searchTerm)) {
            card.style.display = "";
            matches++;
        } else {
            card.style.display = "none";
        }
    });

    noResults.style.display = matches === 0 ? "block" : "none";
});
