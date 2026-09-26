// ui.js - User Interface & Rendering Controller
function switchTab(tab) {
  const drugView = document.getElementById('drugView');
  const classView = document.getElementById('classView');
  const drugBtn = document.getElementById('drugTabBtn');
  const classBtn = document.getElementById('classTabBtn');
  const container = document.getElementById('resultContainer');

  container.innerHTML = '';

  if (tab === 'drug') {
    drugView.classList.remove('hidden');
    classView.classList.add('hidden');
    drugBtn.className = "flex-1 py-3 text-sm font-semibold text-blue-600 border-b-2 border-blue-600 focus:outline-none transition";
    classBtn.className = "flex-1 py-3 text-sm font-semibold text-slate-500 border-b-2 border-transparent hover:text-slate-700 focus:outline-none transition";
  } else {
    drugView.classList.add('hidden');
    classView.classList.remove('hidden');
    classBtn.className = "flex-1 py-3 text-sm font-semibold text-blue-600 border-b-2 border-blue-600 focus:outline-none transition";
    drugBtn.className = "flex-1 py-3 text-sm font-semibold text-slate-500 border-b-2 border-transparent hover:text-slate-700 focus:outline-none transition";
  }
}

async function searchDrug() {
  const query = document.getElementById('drugInput').value.trim().toLowerCase();
  if (!query) return;

  const container = document.getElementById('resultContainer');
  container.innerHTML = '<p class="text-center text-slate-500 py-6">Searching local & cloud clinical records...</p>';

  try {
    const drug = await processDrugSearch(query);
    displayDrugCard(drug);
  } catch (error) {
    container.innerHTML = `<div class="bg-red-50 text-red-600 p-4 rounded-lg text-center text-sm border border-red-200">${error.message}</div>`;
  }
}

function displayDrugCard(drug) {
  const container = document.getElementById('resultContainer');
  container.innerHTML = `
    <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-6">
      <div class="border-b pb-4 flex justify-between items-start">
        <div>
          <h2 class="text-2xl font-bold text-slate-800 uppercase tracking-wide">${drug.generic}</h2>
          <p class="text-sm text-blue-600 font-semibold mt-0.5">Brand Names: ${drug.brand}</p>
        </div>
        <button onclick="document.getElementById('resultContainer').innerHTML='';" class="text-xs text-slate-400 hover:text-slate-600">Back</button>
      </div>

      <div>
        <div class="flex justify-between items-center bg-slate-100 p-2 rounded">
          <h3 class="font-bold text-slate-700 text-xs uppercase tracking-wider">Drug Class</h3>
        </div>
        <p class="text-slate-600 text-sm mt-2 leading-relaxed">${drug.class}</p>
      </div>

      <div>
        <div class="flex justify-between items-center bg-slate-100 p-2 rounded">
          <h3 class="font-bold text-slate-700 text-xs uppercase tracking-wider">Mechanism of Action</h3>
        </div>
        <p class="text-slate-600 text-sm mt-2 leading-relaxed">${drug.mechanism}</p>
      </div>

      <div>
        <div class="flex justify-between items-center bg-slate-100 p-2 rounded">
          <h3 class="font-bold text-slate-700 text-xs uppercase tracking-wider">Therapeutic Use & Indications</h3>
        </div>
        <p class="text-slate-600 text-sm mt-2 leading-relaxed">${drug.indications}</p>
      </div>

      <div>
        <div class="flex justify-between items-center bg-amber-50 p-2 rounded">
          <h3 class="font-bold text-amber-700 text-xs uppercase tracking-wider">Adverse Reactions / Side Effects</h3>
        </div>
        <p class="text-slate-600 text-sm mt-2 leading-relaxed">${drug.adverse}</p>
      </div>

      <div>
        <div class="flex justify-between items-center bg-blue-50 p-2 rounded">
          <h3 class="font-bold text-blue-700 text-xs uppercase tracking-wider">Nursing Considerations & Warnings</h3>
        </div>
        <p class="text-slate-600 text-sm mt-2 leading-relaxed">${drug.nursing}</p>
      </div>

      <div class="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
        <span>Verified Clinical Record</span>
        <a href="${drug.sourceUrl}" target="_blank" class="font-medium text-blue-600 hover:underline flex items-center gap-1">
          🔗 ${drug.sourceName}
        </a>
      </div>
    </div>
  `;
}