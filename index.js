const inputSearch = document.querySelector(".main__search-input");
const autocompliteBox = document.querySelector(".main__list-bar");
const autocompliteConteiner = document.querySelector(".main__search-bar");
const repoConteiner = document.querySelector(".main__repos");
const messageError = document.querySelector(".main__text-error");
let isRepo = null;

// запрос api
async function searchRepo() {
  if (inputSearch.value.trim()) {
    try {
      const response = await fetch(
        `https://api.github.com/search/repositories?q=${inputSearch.value}&per_page=5`
      );
      if (response.ok) {
        let data = await response.json();
        return data.items;
      } else {
        throw new Error(
          `ошибка ${response.status}, попробуйте повторить запрос позже`
        );
      }
    } catch (e) {
      throw new Error("возникла ошибка, попробуйте повторить позже");
    }
  }
}

// функция колбек для импута поиска
async function changeImput() {
  try {
    isRepo = await searchRepo();
    if (!isRepo.length) {
      autocompliteBox.replaceChildren();
      throw new Error(
        "не найдено совпадений, попробуйте ввести другое значение"
      );
    } else {
      messageError.replaceChildren();
    }
    if (autocompliteBox.hasChildNodes()) {
      clearText();
      autocompliteBox.replaceChildren();
      for (let el of isRepo) {
        createItemBar(el.name);
      }
    } else if (!autocompliteBox.hasChildNodes()) {
      clearText();
      for (let el of isRepo) {
        createItemBar(el.name);
      }
    }
  } catch (e) {
    autocompliteBox.replaceChildren();
    getError(e.message);
    if (!inputSearch.value) {
      clearText();
      autocompliteBox.replaceChildren();
    }
  }
}

// функция схлопывания запросов
function debounce(fn, ms) {
  let isWait = null;
  return function (...arg) {
    clearTimeout(isWait);
    isWait = setTimeout(() => {
      fn.apply(this, arg);
    }, ms);
  };
}

const debounceSearch = debounce(changeImput, 400);

const eventSearch = inputSearch.addEventListener("input", debounceSearch);

// создание выподающего списка
function createItemBar(text) {
  const li = document.createElement("li");
  li.classList.add("main__item-bar");
  li.textContent = text;
  li.addEventListener("click", addRepo, {
    once: true,
  });
  const getLi = autocompliteBox.append(li);
  return getLi;
}

// создание списка добавленных репозиториев
function addRepo(e) {
  const div = createEl("div", "main__repo", repoConteiner);
  const h2 = createEl("h2", "main__subtitle", div);
  const span = createEl("span", "main__text", div);
  const spanStar = createEl("span", "main__stars", div);
  const closeBtn = document.createElement("button");
  closeBtn.classList.add("main__btn");
  closeBtn.addEventListener(
    "click",
    (event) => {
      const parent = event.currentTarget.parentElement;
      parent.remove();
    },
    {
      once: true,
    }
  );
  div.append(closeBtn);
  for (let repo of isRepo) {
    if (repo.name === e.target.textContent) {
      h2.textContent = `Name: ${repo.name}`;
      span.textContent = `Owner: ${repo.owner.login}`;
      spanStar.textContent = `Stars: ${repo.stargazers_count}`;
    }
  }
  autocompliteBox.replaceChildren();
  inputSearch.value = "";
}

// создание элемента
function createEl(element, className, parent) {
  const el = document.createElement(element);
  el.classList.add(className);
  parent.append(el);
  return el;
}

// создание поля ошибок
function getError(text) {
  messageError.classList.remove("hidden");
  messageError.textContent = text;
}

// удаление сообщения ошибок
function clearText() {
  messageError.classList.add("hidden");
  messageError.textContent = "";
}
