import express from 'express';
import connectDatabase from './src/database/db.js'
import dotenv from "dotenv";
import contatoRoute from "./src/routes/contato.route.js"

dotenv.config();

const app = express();
const port =process.env.PORT||3001;

connectDatabase() 

app.use(express.json());
app.use("/contato", contatoRoute)
app.use("/",express.static('public'))///rota para o front -- paginas contato e adm/tables 
app.use((req, res, next) => {
    res.append('Access-Control-Allow-Origin', '*');
    res.append('Access-Control-Allow-Headers', '*');
    res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    next();
});

app.listen(3001,()=>console.log(`Servidor rodando na porta ${port}`));
