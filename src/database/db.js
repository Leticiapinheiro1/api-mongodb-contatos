import mongoose from 'mongoose';


const connectDatabase = () => {
    console.log("Espere, estamos conectando ao banco de dados");
    mongoose.connect(process.env.MONGODB_URI).then(() => {
        console.log('Conexão com MongoDB estabelecida com sucesso');
    })
        .catch(err => {
            console.error('Erro ao conectar com MongoDB:', err.message);
        });
};    

export default connectDatabase;