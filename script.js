const glide = document.querySelector('.glide');
const portfolioFramesKey = 'portfolioFrames'; // Correct key

// Initialize portfolio management and Glide carousel on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    setupPortfolioForm(); // Only runs on admin.html (checks isAdminPage internally)
    loadPortfolioFrames(); // Runs on both pages

    // Initialize Glide carousel only if .glide element exists
    if (glide) {
        new Glide(glide, {
            type: "carousel",
            startAt: 0,
            perView: 3,
            gap: 30,
            hoverpause: true,
            autoplay: 2000,
            animationDuration: 800,
            animationTimingFunc: 'linear',
            breakpoints: {
                996: {
                    perView: 2
                },
                768: {
                    perView: 1
                },
            }
        }).mount()
    }
});


const menu = document.querySelector('.menu');
const navOpen = document.querySelector('.hamburger');
const navClose = document.querySelector('.close');
const navBar = document.querySelector('.nav'); // Moved navBar querySelector here for scope

const navLeft = menu.getBoundingClientRect().left; // Initial navLeft value

navOpen.addEventListener('click', ()=>{
    // Check if menu is off-screen (likely for mobile menu behavior)
    if(navLeft < 0){
        menu.classList.add('show');
        document.body.classList.add('show');
        navBar.classList.add('show') // Ensure navBar is defined in scope
    }
})

navClose.addEventListener('click', ()=>{
    if(navLeft < 0){
        menu.classList.remove('show');
        document.body.classList.remove('show');
        navBar.classList.remove('show') // Ensure navBar is defined in scope
    }
})

// Fix nav on scroll

const navHeight = navBar.getBoundingClientRect().height;
const control = document.querySelector('.control');

window.addEventListener('scroll', ()=>{
    const scrollHeight = window.pageYOffset;
    if(scrollHeight > navHeight){
        navBar.classList.add('fix-nav')
    } else {
        navBar.classList.remove('fix-nav')
    }

    control.classList.remove('open') // Close color widget on scroll
})


// Colors Widget

const widget = document.querySelector('.widget');

widget.addEventListener('click', ()=>{
    control.classList.toggle('open')
})

const colors = [...document.querySelectorAll('.colors span')];
document.querySelector(':root').style.setProperty('--customColor','#0044ff') // Default color

colors.forEach(color=>{
    color.addEventListener('click', ()=>{
        const currentColor = color.dataset.id;
        document.querySelector(':root').style.setProperty('--customColor',currentColor)
    })
})


// Scroll to link (Smooth Scroll)

const links = [...document.querySelectorAll('.scroll-link')]
links.map(link=>{
    link.addEventListener('click',e=>{
        e.preventDefault();

        const id = e.target.getAttribute('href').slice(1);
        const el = document.getElementById(id);
        const fixNav = navBar.classList.contains('fix-nav')
        let position = el.offsetTop - navHeight;

        window.scrollTo({
            top: position,
            left: 0
        })
    })
})

// Typeit Text Animations

new TypeIt('#type1', {
    speed: 120,
    loop: true,
    waitUntilVisible: true
}).type('Gulaman E Aale Muhammad',{delay: 300})
.pause(400)
.delete(9)
.type("",{delay: 400})
.pause(500)
.delete(9).go()

new TypeIt('#type2', {
    speed: 120,
    loop: true,
    waitUntilVisible: true
}).type('Gulaman E Aale Muhammad',{delay: 400})
.pause(500)
.delete(9)
.type("Khadim E Imam Ali Riza",{delay: 400})
.pause(500)
.delete(9).go()

// GSAP Initial Animations

gsap.from('.logo', {opacity: 0, duration: 1, delay: .5, y: -10})
gsap.from('.hamburger', {opacity: 0, duration: 1, delay: 1, x: 20})
gsap.from('.banner', {opacity: 0, duration: 1, delay: 1.5, x: -200})
gsap.from('.hero h3', {opacity: 0, duration: 1, delay: 2, y: -50})
gsap.from('.hero h1', {opacity: 0, duration: 1, delay:2.5, y: -45})
gsap.from('.hero h4', {opacity: 0, duration: 1, delay: 3, y: -30})
gsap.from('.hero a', {opacity: 0, duration: 1, delay: 3.5, y: 50})
gsap.from('.nav-item', {opacity: 0, duration: 1, delay: 3, x: -30,stagger: .2})
gsap.from('.icons span', {opacity: 0, duration: 1, delay: 3, x: -30,stagger: .2})

// AOS Initialization
AOS.init()


// Portfolio Management Functions (Correct and Reorganized)

function loadPortfolioFrames() {
    const framesSection = document.getElementById('portfolio-frames');
    if (!framesSection) return;

    framesSection.innerHTML = ''; // Clear existing frames

    let frames = getPortfolioFramesFromStorage();
    if (frames.length === 0) {
        framesSection.innerHTML = '<p class="no-frames">No portfolio items available yet.</p>';
        return;
    }

    frames.forEach(frame => {
        const frameElement = createPortfolioFrame(frame);
        framesSection.appendChild(frameElement);
    });
}

function createPortfolioFrame(frame) {
    const frameDiv = document.createElement('div');
    frameDiv.classList.add('portfolio-frame');

    frameDiv.innerHTML = `
        <div class="frame-image">
            <img src="${frame.imageUrl}" alt="${frame.title}">
        </div>
        <div class="frame-content">
            <h3>${frame.title}</h3>
            <p>${frame.description}</p>
            <div class="frame-links">
                <a href="${frame.projectUrl}" class="btn" target="_blank">View Project</a>
                ${isAdminPage() ? `
                    <button class="btn modify-btn" onclick="modifyFrame('${frame.id}')">Modify</button>
                    <button class="btn delete-btn" onclick="deleteFrame('${frame.id}')">Delete</button>
                ` : ''}
            </div>
        </div>
    `;

    return frameDiv;
}

function setupPortfolioForm() {
    const form = document.getElementById('add-portfolio-form');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const imageFile = document.getElementById('frame-image').files[0]; // Get the selected file
        let imageUrlValue = ""; // Initialize imageUrlValue

        // Handle image upload only if a file is selected
        if (imageFile) {
            const reader = new FileReader(); // Use FileReader to read file as Base64

            reader.onloadend = function() {
                imageUrlValue = reader.result; // Base64 string of the image

                const formData = {
                    id: form.dataset.editId || Date.now().toString(), // Use editId if modifying, else generate new ID
                    imageUrl: imageUrlValue, // Store Base64 image data
                    title: document.getElementById('frame-title').value,
                    description: document.getElementById('frame-description').value,
                    projectUrl: document.getElementById('frame-url').value,
                    timestamp: new Date().toLocaleString()
                };

                if (form.dataset.editId) {
                    updateFrame(form.dataset.editId, formData);
                    form.removeAttribute('data-edit-id'); // Clear editId after update
                    document.querySelector('button[type="submit"]').textContent = 'Add Frame'; // Reset button text
                } else {
                    saveFrameToStorage(formData);
                }

                form.reset(); // Clear form fields (including file input)
                loadPortfolioFrames(); // Reload portfolio display
            }

            reader.readAsDataURL(imageFile); // Read the file as Base64 data URL
        } else {
            // Handle case where no image file is selected (if you want to make image optional, you can adjust validation)
            alert("Please select an image file for the book cover.");
            return; // Prevent form submission if no image
        }
    });
}


function modifyFrame(frameId) {
    const frames = getPortfolioFramesFromStorage();
    const frame = frames.find(f => f.id === frameId);
    if (!frame) return;

    const form = document.getElementById('add-portfolio-form');
    form.dataset.editId = frameId; // Set editId for form submission

    // For file upload, we can't pre-fill the file input with Base64 data directly for security reasons and browser limitations.
    // You might choose to display the existing image separately if needed, but for this basic example, we'll just leave the file input empty on modify.
    // document.getElementById('frame-image').value = frame.imageUrl; // Not applicable for file input with Base64

    document.getElementById('frame-title').value = frame.title;
    document.getElementById('frame-description').value = frame.description;
    document.getElementById('frame-url').value = frame.projectUrl;

    document.querySelector('button[type="submit"]').textContent = 'Update Frame'; // Change button text to indicate update mode
}

function deleteFrame(frameId) {
    if (!confirm('Are you sure you want to delete this portfolio item?')) return;

    let frames = getPortfolioFramesFromStorage();
    frames = frames.filter(frame => frame.id !== frameId);
    localStorage.setItem(portfolioFramesKey, JSON.stringify(frames));

    loadPortfolioFrames(); // Reload portfolio display after deletion
}

function updateFrame(frameId, newData) {
    let frames = getPortfolioFramesFromStorage();
    const index = frames.findIndex(frame => frame.id === frameId);

    if (index !== -1) {
        frames[index] = { ...frames[index], ...newData }; // Merge existing data with new data
        localStorage.setItem(portfolioFramesKey, JSON.stringify(frames));
    }
}

function getPortfolioFramesFromStorage() {
    const storedFrames = localStorage.getItem(portfolioFramesKey);
    return storedFrames ? JSON.parse(storedFrames) : []; // Return parsed array or empty array if null
}

function saveFrameToStorage(frame) {
    let frames = getPortfolioFramesFromStorage();
    frames.push(frame); // Add new frame to array
    localStorage.setItem(portfolioFramesKey, JSON.stringify(frames)); // Save updated array to localStorage
}

function isAdminPage() {
    return window.location.pathname.includes('admin'); // Check if pathname contains 'admin'
}
