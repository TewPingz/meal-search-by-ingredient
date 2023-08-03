import { useEffect, useState } from "react";
import "./App.css";

type Recipe = {
  strMeal: string;
  strMealThumb: string;
  idMeal: number;
};

type Ingredient = {
  idIngredient: number;
  strIngredient: string;
};

function App() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [toggledIngredients, setToggledIngredients] = useState<string[]>([]);
  const [foundRecipes, setFoundRecipes] = useState(() => new Set<Recipe>());
  const [fetchedRecipes, setFetchedRecipes] = useState<{
    [key: string]: Recipe[];
  }>({});

  const fetchIngredientData = () => {
    fetch("https://www.themealdb.com/api/json/v1/1/list.php?i=list")
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        setIngredients(data["meals"]);
      });
  };

  const toggleIngredient = async (ingredient: Ingredient) => {
    const index = toggledIngredients.indexOf(ingredient.strIngredient);
    var updatedToggledIngredients: string[] = [];
    console.log(index);
    if (index == -1) {
      // Add element
      updatedToggledIngredients = [
        ...toggledIngredients,
        ingredient.strIngredient,
      ];
    } else {
      // Remove element
      updatedToggledIngredients = toggledIngredients.filter(
        (element) => element != ingredient.strIngredient
      );
    }

    setToggledIngredients(updatedToggledIngredients);
    await findRecipesWithIngridents(updatedToggledIngredients);
  };

  const isIngredientToggled = (ingredient: Ingredient) => {
    return toggledIngredients.indexOf(ingredient.strIngredient) > -1;
  };

  const findRecipesWithIngridents = async (
    updatedToggledIngredients: string[]
  ) => {
    const foundRecipes = new Set<Recipe>();

    for (const toggledIngredient of updatedToggledIngredients) {
      if (fetchedRecipes[toggledIngredient]) {
        for (const fetchedRecipe of fetchedRecipes[toggledIngredient]) {
          foundRecipes.add(fetchedRecipe);
        }
      } else {
        await fetch(
          "https://www.themealdb.com/api/json/v1/1/filter.php?i=" +
            toggledIngredient
        )
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            return data["meals"];
          })
          .then((data: Recipe[]) => {
            setFetchedRecipes({ ...fetchedRecipes, toggledIngredient: data });
            for (const fetchedRecipe of data) {
              foundRecipes.add(fetchedRecipe);
            }
          });
      }
    }

    setFoundRecipes(foundRecipes);
  };

  useEffect(() => {
    fetchIngredientData();
  }, []);

  return (
    <>
      <div className="ingredient-section">
        {ingredients &&
          ingredients.map((ingredient: Ingredient) => (
            <button
              style={
                isIngredientToggled(ingredient)
                  ? { backgroundColor: "green" }
                  : { background: "#D2042D" }
              }
              onClick={async () => await toggleIngredient(ingredient)}
              key={ingredient.idIngredient}
            >
              {ingredient.strIngredient}
            </button>
          ))}
      </div>

      <div className="recipe-section">
        {Array.from(foundRecipes.values()).map((recipe) => (
          <div className="recipe-card">
            <img src={recipe.strMealThumb}></img>
          </div>
        ))}
      </div>
    </>
  );
}

export default App;
