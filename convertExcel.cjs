const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const excelPath = path.join(__dirname, 'VidyaFrame_SEO_Content_Roadmap.xlsx');
const outputPath = path.join(__dirname, 'src', 'data', 'topics.json');

console.log('Reading Excel file from:', excelPath);

try {
  // Ensure the target data folder exists
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  const workbook = xlsx.readFile(excelPath);
  
  // The sheet containing the roadmap
  const sheetName = 'Complete Roadmap';
  if (!workbook.SheetNames.includes(sheetName)) {
    throw new Error(`Sheet name "${sheetName}" not found in workbook. Available sheets: ${workbook.SheetNames.join(', ')}`);
  }

  const worksheet = workbook.Sheets[sheetName];
  const rawData = xlsx.utils.sheet_to_json(worksheet);

  console.log(`Successfully parsed Excel sheet. Total raw rows: ${rawData.length}`);

  const cleanedData = rawData.map((row, index) => {
    // Clean and normalize status: '✅ EXISTS' -> 'EXISTS', '🆕 TO CREATE' -> 'TO CREATE'
    let status = 'TO CREATE';
    if (row['Status']) {
      const s = row['Status'].toString().toUpperCase();
      if (s.includes('EXISTS')) {
        status = 'EXISTS';
      } else if (s.includes('CREATE')) {
        status = 'TO CREATE';
      }
    }

    // Clean target classes range
    const classes = (row['Target Classes'] || '').toString().trim();

    // Map fields to match target JSON structure
    return {
      id: parseInt(row['S.No.']) || (index + 1),
      subject: (row['Subject'] || '').toString().trim(),
      topic_name: (row['Topic Name'] || '').toString().trim(),
      folder: (row['Folder'] || '').toString().trim(),
      page_url: (row['Page URL'] || '').toString().trim(),
      seo_slug: (row['SEO Slug'] || '').toString().trim(),
      classes: classes,
      description: (row['Description (Meta)'] || '').toString().trim(),
      charts_count: parseInt(row['Charts (Est.)']) || 0,
      worksheets_count: parseInt(row['Worksheets (Est.)']) || 0,
      total_assets: parseInt(row['Total Assets']) || 0,
      priority: (row['Priority'] || '').toString().trim(),
      status: status,
      content_notes: (row['Content Notes'] || '').toString().trim()
    };
  });

  // Write JSON
  fs.writeFileSync(outputPath, JSON.stringify(cleanedData, null, 2), 'utf8');
  console.log(`✅ Data conversion complete! Saved ${cleanedData.length} topics to ${outputPath}`);

} catch (error) {
  console.error('❌ Data conversion failed:', error.message);
  process.exit(1);
}
