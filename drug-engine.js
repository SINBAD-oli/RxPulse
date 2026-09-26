// drug-engine.js - Core Drug Lookup & Caching Engine
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

async function processDrugSearch(query) {
  // Tier 1: Check Local JSON Database
  let found = drugDatabase.find(d => d.generic.toLowerCase() === query || d.brand.toLowerCase().includes(query));
  if (found) {
    return found;
  }

  try {
    // Tier 2: Check Cloud Firestore Cache
    const docRef = db.collection('drugs').doc(query);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      return docSnap.data();
    }

    // Tier 3: Verified API Fetch & Sanitize
    const fdaUrl = `https://api.fda.gov/drug/label.json?search=openfda.generic_name:${encodeURIComponent(query)}+AND+openfda.product_type:"HUMAN PRESCRIPTION DRUG"&limit=1`;
    
    let response = await fetch(fdaUrl);
    if (!response.ok) throw new Error('Medication not found in federal prescription database.');

    const data = await response.json();
    const drug = data.results[0];

    const cleanRecord = {
      generic: drug.openfda?.generic_name?.[0] || query,
      brand: drug.openfda?.brand_name?.[0] || 'Standard Generic',
      class: drug.openfda?.pharm_class_epc?.[0] || 'Drug class data pending clinical review.',
      mechanism: drug.openfda?.pharm_class_moa?.[0] || 'Refer to official package insert mechanism descriptions.',
      indications: drug.indications_and_usage?.[0] || 'No therapeutic use / indications listed.',
      adverse: drug.adverse_reactions?.[0] || 'No adverse reactions listed.',
      nursing: drug.warnings?.[0] || drug.boxed_warning?.[0] || drug.precautions?.[0] || 'No specific nursing considerations listed.',
      sourceName: 'openFDA / NIH DailyMed Official Record',
      sourceUrl: `https://dailymed.nlm.nih.gov/dailymed/search.label?labeltype=all&query=${encodeURIComponent(query)}`
    };

    // Automatically append to Firestore for persistent cloud caching
    await docRef.set(cleanRecord);
    return cleanRecord;

  } catch (error) {
    throw new Error(`Could not verify clinical data for "${query}". Ensure it is a valid human prescription drug.`);
  }
}