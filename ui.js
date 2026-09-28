// ui.js
import { processDrugSearch } from "./drug-engine.js";

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

// Helper to render sections with collapsible long text
function renderSection(title, text, headerBgClass, headerTextClass) {
  const maxLength = 200;
  const isLong = text.length > maxLength;
  const shortText = isLong ? text.substring(0, maxLength) + '...' : text;
  const sectionId = 'sec_' + Math.random().toString(36.substring(2, 9));

  return `
    <div>
      <div class="flex justify-between items-center ${headerBgClass} p-2 rounded">
        <h3 class="font-bold ${headerTextClass} text-xs uppercase tracking-wider">${title}</h3>
      </div>
      <p id="${sectionId}_short" class="text-slate-700 text-sm mt-2 leading-relaxed">${shortText}</p>
      ${isLong ? `
        <p id="${sectionId}_full" class="text-slate-700 text-sm mt-2 leading-relaxed hidden">${text}</p>
        <button onclick="
          document.getElementById('${sectionId}_short').classList.toggle('hidden');
          document.getElementById('${sectionId}_full').classList.toggle('hidden');
          this.innerText = this.innerText === 'Show More ▼' ? 'Show Less ▲' : 'Show More ▼';
        " class="text-xs font-semibold text-blue-600 hover:text-blue-800 mt-2 focus:outline-none">Show More ▼</button>
      ` : ''}
    </div>
  `;
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

      ${renderSection('Drug Class', drug.class, 'bg-slate-100', 'text-slate-700')}
      ${renderSection('Mechanism of Action', drug.mechanism, 'bg-slate-100', 'text-slate-700')}
      ${renderSection('Therapeutic Use & Indications', drug.indications, 'bg-slate-100', 'text-slate-700')}
      ${renderSection('Adverse Reactions / Side Effects', drug.adverse, 'bg-amber-50', 'text-amber-700')}
      ${renderSection('Nursing Considerations & Warnings', drug.nursing, 'bg-blue-50', 'text-blue-700')}

      <div class="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
        <span>Verified Clinical Record</span>
        <a href="${drug.sourceUrl}" target="_blank" class="font-medium text-blue-600 hover:underline flex items-center gap-1">
          🔗 ${drug.sourceName}
        </a>
      </div>
    </div>
  `;
}

// Expose functions globally for inline HTML event handlers
window.switchTab = switchTab;
window.searchDrug = searchDrug;