const express = require("express");
const server = express();

// Pegar o banco de dados
const db = require("./database/db")

// Configurar pasta publica
server.use(express.static("public"));

// habilitar o uso do req.body na nossa aplicação
server.use(express.urlencoded({ extended: true }))

// Ligar o servidor
server.listen(3000);

// Configurar caminhos na minha aplicação
// Pagina inicial
// req:Requisição   // res:Resposta
server.get("/", (req, res) => {
    return res.render("index.html");
});

server.get("/create-point", (req, res) => {
    return res.render("create-point.html");
});

server.post("/savepoint", (req, res) => {
    // Inserir dados da tabela
    const query = `
            INSERT INTO places (
                image,
                name,
                address,
                address2,
                state,
                city,
                items
            ) VALUES (?,?,?,?,?,?,?);
    `

    const values = [
        req.body.image,
        req.body.name,
        req.body.address,
        req.body.address2,
        req.body.state,
        req.body.city,
        req.body.items
    ]

    function afterInsertData(err) {
        if (err) {
            return res.render("create-point.html", { error: true })
        }

        console.log("Cadastrado com sucesso")
        console.log(this)
        return res.render("create-point.html", { saved: true })
    }

    db.run(query, values, afterInsertData)
});

server.get("/search", (req, res) => {

    const search = req.query.search

    if (search == "") {
        // pesquisa vazia
        return res.render("search-results.html", { total: 0 })
    }
    // pegar os dados do banco de dados
    db.all(`SELECT * FROM places WHERE city LIKE '%${search}%'`, function (err, rows) {
        if (err) {
            return console.log(err)
        }
        const total = rows.length
        return res.render("search-results.html", { places: rows, total: total })
    })


});

// Utilizando tampletes engines
const nunjunk = require("nunjucks");
nunjunk.configure("src/views", {
    express: server,
    noCache: true,
});
