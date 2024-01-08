import config from '../../config';

export default function DisplayResultsComponent({
  searchResults,
  setRecipe,
  setShowAddRecipeForm,
}) {
  const apiKey = config.API_KEY;

  const handleClick = async (recipeId) => {
    try {
      const recipeApiUrl = `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${apiKey}`;
      const recipeResponse = await fetch(recipeApiUrl);

      if (!recipeResponse.ok) {
        throw new Error('Network response was not ok.');
      }

      const recipeData = await recipeResponse.json();

      const htmlInstructionsResponse = recipeData.instructions;
      const plainTextInstructions = extractPlainText(htmlInstructionsResponse);

      setRecipe({
        ...recipeData,
        plainTextInstructions: plainTextInstructions,
      });
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
      setRecipe(null);
    }
  };

  const extractPlainText = (htmlContent) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;

    //get all the <ol> elements within the tempDiv
    const orderedList = tempDiv.querySelectorAll('ol');

    //iterate through each <ol> and its <li> elements
    orderedList.forEach((ol) => {

      //get all the <li> elements within the tempDiv above
      const listItems = ol.querySelectorAll('li');

      //iterate through each <li> and add a step number
      listItems.forEach((li, index) => {
         //add a line break after the text node
        if(index < listItems.length - 1) {
          const lineBreak = document.createElement('br');
          ol.insertBefore(lineBreak, li.nextSibling);
        }
        const stepNumber = index + 1;
        const textNode = document.createTextNode(`${stepNumber}. ${li.textContent}\n`);

        //replace the original <li> with the new text node
        li.replaceWith(textNode);
      });
    });

    // console.log(tempDiv);

    return tempDiv.textContent || tempDiv.innerText;
  };

  return (
    <div className="resultsDisplay">
      {searchResults &&
      searchResults.results &&
      searchResults.results.length > 0 ? (
        <div>
          <h2>Search Results</h2>
          <ul class="resultsList">
            {searchResults.results.map((result, index) => (
              <li key={index} class="resultItem">
                <img src={result.image} />
                <span
                  onClick={() => {
                    setShowAddRecipeForm(false);
                    handleClick(result.id);
                  }}
                >{result.title}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>No recipes found yet</p>
      )}
    </div>
  );
}
