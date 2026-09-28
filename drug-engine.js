// drug-engine.js
import { db } from "./firebase-config.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

let drugDatabase = [];

async function loadDatabase() {
  try {
    const response = await fetch('drugs.json');
    drugDatabase = await response.json();
  } catch (error) {
    console.error('Failed to load local drug database:', error);
  }
}
loadDatabase();

export async function processDrugSearch(rawQuery) {
  const query = rawQuery.trim().toLowerCase();
  
  // Tier 1: Check Local JSON Database
  let found = drugDatabase.find(d => d.generic.toLowerCase() === query || d.brand.toLowerCase().includes(query));
  if (found) {
    return found;
  }

  try {
    // Tier 2: Check Cloud Firestore Cache
    const docRef = doc(db, 'drugs', query);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    }

    // Tier 3: openFDA API Lookup
    let fdaUrl = `https://api.fda.gov/drug/label.json?search=openfda.generic_name:"${encodeURIComponent(query)}"&limit=1`;
    let response = await fetch(fdaUrl);

    if (!response.ok) {
      fdaUrl = `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${encodeURIComponent(query)}"&limit=1`;
      response = await fetch(fdaUrl);
    }

    if (!response.ok) throw new Error('Medication not found in federal prescription database.');

    const data = await response.json();
    const drug = data.results[0];

    const cleanRecord = {
      generic: drug.openfda?.generic_name?.[0] || query,
      brand: drug.openfda?.brand_name?.[0] || 'Standard Generic',
      class: drug.openfda?.pharm_class_epc?.[0] || drug.openfda?.pharm_class_cs?.[0] || 'Drug class data pending clinical review.',
      mechanism: drug.mechanism_of_action?.[0] || drug.clinical_pharmacology?.[0] || drug.openfda?.pharm_class_moa?.[0] || 'Refer to official package insert mechanism descriptions.',
      indications: drug.indications_and_usage?.[0] || drug.purpose?.[0] || 'No therapeutic use / indications listed.',
      adverse: drug.adverse_reactions?.[0] || drug.consumer_adverse_reactions?.[0] || 'No adverse reactions listed.',
      nursing: drug.warnings?.[0] || drug.boxed_warning?.[0] || drug.precautions?.[0] || drug.do_not_use?.[0] || 'No specific nursing considerations listed.',
      sourceName: 'openFDA / NIH DailyMed Official Record',
      sourceUrl: `https://dailymed.nlm.nih.gov/dailymed/search.label?labeltype=all&query=${encodeURIComponent(query)}`
    };

    // Automatically cache record in Firestore
    await setDoc(docRef, cleanRecord);
    return cleanRecord;

  } catch (error) {
    throw new Error(`Could not verify clinical data for "${rawQuery}". Ensure it is a valid human prescription drug.`);
  }
}