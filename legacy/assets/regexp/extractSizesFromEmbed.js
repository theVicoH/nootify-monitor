// export function extractSizesFromEmbed(embed) {
//     console.log("🚀 ~ file: extractSizesFromEmbed.js:2 ~ extractSizesFromEmbed ~ embed.fields:", embed.fields)
    
//     const allSizes = [];

//     //const fields = embed.embeds[0].fields;
//     const fields = embed.fields;
  
//     for (const field of fields) {
//       if (field.name.toLowerCase().includes("sizes")) {
//         const sizesArray = field.value.split('\n');
  
//         for (const size of sizesArray) {
//           // delete all spaces and others characters not wanted
//           const cleanedSize = size.trim();
//           if (cleanedSize.length > 0) {
//             allSizes.push(cleanedSize);
//           }
//         }
//       }
//     }
  
//     if (allSizes.length > 0) {
//       return allSizes;
//     } else {
//       return null; 
//     }
// }

export function extractSizesFromEmbed(embed) {
  console.log("🚀 ~ file: extractSizesFromEmbed.js:2 ~ extractSizesFromEmbed ~ embed.fields:", embed.fields)


  const allSizes = [];
  const sizeRegex = /(\b\d{1,5}(?:\.\d{1,5})?(?:\s+\d{1,5}\/\d{1,5})?\b)/g; // Regular expression to match numeric sizes with optional slash

  // Obtenez la liste des champs de l'objet "embed"
  // const fields = embed.embeds[0].fields;
  const fields = embed.fields;
  // Parcourez tous les champs pour trouver ceux avec le nom "Sizes"
  for (const field of fields) {
    if (field.name.toLowerCase().includes("sizes") && ! field.name.toLowerCase().includes("sold out")) {
      const fieldValue = field.value;

      // Recherchez les correspondances de tailles numériques dans le champ "value" en utilisant la regex
      const sizeMatches = fieldValue.match(sizeRegex);

      if (sizeMatches) {
        // Ajoutez les tailles trouvées au tableau final
        for (const size of sizeMatches) {
          allSizes.push(size);
        }
      }
    }
  }

  // Vérifiez si des tailles ont été trouvées
  if (allSizes.length > 0) {
    return allSizes;
  } else {
    return null; // Aucune taille trouvée, retournez null
  }
}