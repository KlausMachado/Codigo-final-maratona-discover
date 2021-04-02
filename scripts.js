const Modal = {
  open() {
    //Abrir modal
    //Adicionar a class active ao modal
    document.querySelector(".modal-overlay").classList.add("active"); //selecione onde tiver a classe modal-overlay, e adicione a classe active a lista de classes desse elemento
  },
  close() {
    //Fechar o modal
    //remover a class active do modal
    document.querySelector(".modal-overlay").classList.remove("active"); //selecione onde tiver a classe modal-overlay, e adicione a classe active a lista de classes desse elemento
  },
};

const Storage = {
  //armazenar os dados no local storage

  //pegando as informações
  get() {
    return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []; //ou pega as informações e retorna em um array OU retorna um array vazio
  },
  //guardando as informações
  set(transactions) {
    localStorage.setItem(
      "dev.finances:transactions",
      JSON.stringify(transactions)
    ); //foi ao local storage,  salvamos um item passando um nome '' e um objeto JSON que recebe uma string e essa stringo é o transactions (a const que criamos depois)
  },
};

//Primeiro somar as entradas
//2 somas as saidas
//3 remover do total das entradas o valor total das saidas
//4 e ai retornar o valor total
const Transaction = {
  all: Storage.get(),

  add(transaction) {
    //adicionando novas transações
    Transaction.all.push(transaction);

    App.reload();
  },

  remove(index) {
    Transaction.all.splice(index, 1); //splice é uma funcionalidade para arrays que recebe qual o index (numero da posição do elemento) que voce quer e quantos deve deletar

    App.reload();
  },

  incomes() {
    //Para somar as entradas
    let income = 0;
    //preciso pegar todas as transações
    Transaction.all.forEach((transaction) => {
      //verificar se a transação é maior que zero;
      if (transaction.amount > 0) {
        //Se for maior que zero somar a uma variavel
        income += transaction.amount; //atribuimos um valor ao income, que é ele mesmo + o valor de amount
      }
    });
    //e retornar a variavel
    return income;
  },
  expenses() {
    let expense = 0;
    //preciso pegar todas as transações
    Transaction.all.forEach((transaction) => {
      //verificar se a transação é menor que zero;
      if (transaction.amount < 0) {
        //Se for maior que zero somar a uma variavel
        expense += transaction.amount; //atribuimos um valor ao expense, que é ele mesmo + o valor de amount
      }
    });
    //somar as saidas
    return expense;
  },
  total() {
    //entradas menos saidas
    return Transaction.incomes() + Transaction.expenses();
  },
};

//substituir os dados HTML (da tabela) pelos dados Js
const DOM = {
  transactionsContainer: document.querySelector("#data-table tbody"),

  addTransaction(transaction, index) {
    const tr = document.createElement("tr");
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
    tr.dataset.index = index;

    DOM.transactionsContainer.appendChild(tr);
  },

  innerHTMLTransaction(transaction, index) {
    const CSSclass = transaction.amount > 0 ? "income" : "expense"; //mudando pra classe income quando o numero for positivo se não coloca a class expense

    const amount = Utils.formatCurrency(transaction.amount);

    const html = `
        
            <td class="description">${transaction.description}</td>
                <td class=${CSSclass}>${amount}</td>
                <td class="date">${transaction.date}</td>
                <td>
                <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação" />
            </td>
        `;

    return html;
  },

  updateBalance() {
    //substituindo os valores html do balance por js
    document.getElementById("incomeDisplay").innerHTML = Utils.formatCurrency(
      Transaction.incomes()
    ); //coloca soma das entradas
    document.getElementById("expenseDisplay").innerHTML = Utils.formatCurrency(
      Transaction.expenses()
    ); //coloca soma das entradas     //coloca soma das saidas
    document.getElementById("totalDisplay").innerHTML = Utils.formatCurrency(
      Transaction.total()
    ); //coloca entradas menos saidas
  },

  clearTransactions() {
    DOM.transactionsContainer.innerHTML = "";
  },
};

const Utils = {
  //codigos uteis, que vai usar no resto do codigo
  formatAmount(value) {
    value = Number(value) * 100;

    return value;
  },
  formatDate(date) {
    const splittedDate = date.split("-"); //o split pega a parte da string que voce quer e retira da string inteira e coloca dentro de um array

    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`; //transforma em string e mudamos a ordem em que os elementos do array vão ser apresentados
  },
  formatCurrency(value) {
    //formatanto o tipo de moeda
    const signal = Number(value) < 0 ? "-" : ""; //forçamos o valor a ser um numero e se o numero for menor que zero ele irá adicionar o sinal de negativo ,se não não adiciona nada.

    value = String(value).replace(/\D/g, ""); //primeiro força a ser uma string, depois com o replace ele vai pegar tudo que não for numero e substituir por um vazio, por nada. o /\D significa que ele vai pegar o que não é numero e o /g que ele vai pegar no abiente global, então vai pegar todos

    value = Number(value) / 100; //adiciona casas decimais

    value = value.toLocaleString("pt-BR", {
      //transforma o valor para moeda brasileira
      style: "currency",
      currency: "BRL",
    });

    return signal + value;
  },
};

const Form = {
  //pegando os dados html para usar nas ações do formulario JS
  description: document.querySelector("input#description"),
  amount: document.querySelector("input#amount"),
  date: document.querySelector("input#date"),

  //pegando os valores de cada dado html
  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value,
    };
  },

  //verificar se todas as informações foram preenchidas
  validateFields() {
    const { description, amount, date } = Form.getValues(); //pegando cada dado e colocando em uma variavel

    if (
      description.trim() === "" ||
      amount.trim() === "" ||
      date.trim() === ""
    ) {
      //se um dos elementos estiver vazio execute o erro
      throw new Error("Preencha todos os campos");
    }
  },

  formatValues() {
    let { description, amount, date } = Form.getValues(); //pegando cada dado e colocando em uma variavel

    amount = Utils.formatAmount(amount);

    date = Utils.formatDate(date);

    return {
      description,
      amount,
      date,
    };
  },

  clearFiels() {
    Form.description.value = "";
    Form.amount.value = "";
    Form.date.value = "";
  },

  submit(event) {
    event.preventDefault(); //para não enviar da forma padrão, pois a forma padrão adiciona muita informação na url

    try {
      //verificar se todas as informações foram preenchidas
      Form.validateFields();
      //formatar os dados para salvar
      const transaction = Form.formatValues();
      //salvar os dados
      Transaction.add(transaction); //e no add tem um reload então não precisa atualizar de novo depois
      //apagar os dados do formulario
      Form.clearFiels();
      //modal fecha
      Modal.close();
    } catch (error) {
      alert(error.message);
    }
  },
};

const App = {
  init() {
    Transaction.all.forEach((transaction, index) => {
      DOM.addTransaction(transaction, index);
    }); //pega cada um dos objetos do array e executa a função em cada objeto, essa função vai rodar a const DOM passando a transação do momento como parametro
    DOM.updateBalance();

    Storage.set(Transaction.all)
  },

  reload() {
    DOM.clearTransactions();
    App.init();
  },
};

App.init();
