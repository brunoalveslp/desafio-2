//divs da table
const addModal = document.querySelector(".add-modal");
const cotModal = document.querySelector(".cot-modal");
const table = document.querySelector(".table-operation");
//botões da Pagina
const btnAdd = document.querySelector(".btn-add");
const btnCot = document.querySelector(".btn-cot");
const alterar = document.querySelector("#alterar");
//botões relatorios
const btnConvertido = document.querySelector("#convertido");
const btnTaxas = document.querySelector("#taxas");
//botões formulario
const nome = document.querySelector("#nameInput");
const valor = document.querySelector("#valorDeOrigem");
const data = document.querySelector("#date");
const origem = document.querySelector("#from");
const destino = document.querySelector("#to");
const valorDestino = document.querySelector("#valorDeDestino");
const taxa = document.querySelector("#taxa");
const valorFinal = document.querySelector("#valorFinal");
const cadastrar = document.querySelector("#cadastrar");
//seletor de alteração cotação
const selectCot = document.getElementById("cotacao");
//variaveis
let valorConvertido;
let valorTaxa;
let total;
var totalConvertidoTemp = [];
var totalTaxasTemp = [];

//Instacias Database
let dbRef = db.ref();
let operationRef = db.ref("operations");
dbRef.on("value", hasData, hasError);

btnAdd.addEventListener("click", () => {
  addModal.classList.add("modal-show");
});

btnCot.addEventListener("click", () => {
  cotModal.classList.add("modal-show");
});

window.addEventListener("click", (e) => {
  if (e.target === addModal) {
    addModal.classList.remove("modal-show");
  } else if (e.target === cotModal) {
    cotModal.classList.remove("modal-show");
  }
});

selectCot.addEventListener("change", () => {
  let showcot = document.getElementById("showcot");
  let id;
  let nome;
  dbRef.on("value", data);
  function data(value) {
    let { coins } = value.val();
    for (let coin in coins) {
      if (coins[coin].name === selectCot.value) {
        showcot.innerText =
          parseFloat(coins[coin].valor).toFixed(2) + coins[coin].name;
        id = coin;
        nome = coins[coin].name;
      }
      alterar.addEventListener("click", () => {
        let nv = document.getElementById("novoValor");
        let obj = {
          name: nome,
          valor: nv.value,
        };

        db.ref("coins/" + id).set(obj);
        document.location.reload(true);
      });
    }
  }
});

function hasOperation(operations) {
  populateTable(operations);
}

function hasData(data) {
  let { coins } = data.val();
  let { operations } = data.val();
  hasOperation(operations);

  btnConvertido.addEventListener("click", () => {
    let valorTotal = 0;
    const selectMoeda = document.querySelector("#moedaConvertida");
    const showTotal = document.querySelector("#showTotConv");
    for (let op of totalConvertidoTemp) {
      let valorOrigem;
      let valorDes;
      for (let coin in coins) {
        if (coins[coin].name === op.origem) valorOrigem = coins[coin].valor;

        if (coins[coin].name === selectMoeda.value)
          valorDes = coins[coin].valor;
      }
      valorTotal += parseFloat(calcular(valorOrigem, valorDes, op.valor));
    }

    showTotal.innerText = `${valorTotal.toFixed(2)} ${selectMoeda.value}`;
  });

  btnTaxas.addEventListener("click", () => {
    let valorTotal = 0;
    const selectMoeda = document.querySelector("#moedaTaxas");
    const showTotal = document.querySelector("#showTotTax");
    for (let op of totalTaxasTemp) {
      let valorOrigem;
      let valorDes;
      for (let coin in coins) {
        if (coins[coin].name === op.origem) valorOrigem = coins[coin].valor;

        if (coins[coin].name === selectMoeda.value)
          valorDes = coins[coin].valor;
      }
      valorTotal += parseFloat(calcular(valorOrigem, valorDes, op.valor));
    }

    showTotal.innerText = `${valorTotal.toFixed(2)} ${selectMoeda.value}`;
  });

  valor.addEventListener("keyup", () => {
    let coinOrigem;
    let coinDestino;
    for (let coin in coins) {
      if (coins[coin].name === origem.value) coinOrigem = coins[coin].valor;

      if (coins[coin].name === destino.value) coinDestino = coins[coin].valor;
    }
    valorConvertido = calcular(coinOrigem, coinDestino, valor.value).toFixed(2);
    valorDestino.innerHTML = `${valorConvertido} ${destino.value}`;
    valorTaxa = taxar(valorConvertido, 10).toFixed(2);
    taxa.innerHTML = `${valorTaxa} ${destino.value}`;
    total = valorConvertido - valorTaxa;
    valorFinal.innerHTML = `${total.toFixed(2)} ${destino.value}`;
  });
}

cadastrar.addEventListener("click", () => {
  operation = {
    name: nome.value,
    date: data.value,
    moedaOrigem: origem.value,
    moedaDestino: destino.value,
    valorInicial: valor.value,
    valorConvertido: valorConvertido,
    taxa: valorTaxa,
    valorFinal: total,
  };
  operationRef.push(operation);
  document.location.reload(true);
  alert("Operação realizada!");
});

function hasError(err) {
  console.log("erro" + err);
}

function taxar(valor, perCent) {
  return (valor / 100) * perCent;
}

function calcular(origem, destino, montante) {
  let moedaDeOrigem = origem;
  let moedaDeDestino = destino;
  let valor = montante;

  return (valor * moedaDeOrigem) / moedaDeDestino;
}

function populateTable(operations) {
  for (let operation in operations) {
    totalConvertidoTemp.push({
      origem: operations[operation].moedaDestino,
      valor: operations[operation].valorConvertido,
    });

    totalTaxasTemp.push({
      origem: operations[operation].moedaDestino,
      valor: operations[operation].taxa,
    });

    let date = new Date(
      operations[operation].date.split("-")
    ).toLocaleDateString("pt-br");

    let tr = `
    <tr>
    <td>${operations[operation].name}</td>
    <td>${date}</td>
    <td>${parseFloat(operations[operation].valorInicial).toFixed(2)} ${
      operations[operation].moedaOrigem
    }</td>
    <td>${operations[operation].moedaOrigem}</td>
    <td>${operations[operation].moedaDestino}</td>
    <td>${parseFloat(operations[operation].valorConvertido).toFixed(2)} ${
      operations[operation].moedaDestino
    }</td>
    <td>${parseFloat(operations[operation].taxa).toFixed(2)} ${
      operations[operation].moedaDestino
    }</td>
    <td>${parseFloat(operations[operation].valorFinal).toFixed(2)} ${
      operations[operation].moedaDestino
    }</td>
    </tr>
    `;
    table.insertAdjacentHTML("beforeend", tr);
  }
}
