function updateCount(fieldId, maxLength) {
    const field = document.getElementById(fieldId);
    const counter = document.getElementById(fieldId + "Counter");
    
    field.addEventListener('keyup', ()=>{
        let remaining = maxLength - field.value.length;
        counter.textContent =  `${remaining}/${maxLength}`;
        
        // Change color if near the limit
        counter.style.color = remaining < 20 ? "red" : "black";
    })
}

// Initialize counters on page load
document.addEventListener("DOMContentLoaded", () => {
    updateCount("title", 60);
    updateCount("content", 300);
});
