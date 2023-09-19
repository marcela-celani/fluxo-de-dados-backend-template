import express, { Request, Response } from 'express'
import cors from 'cors'
import { accounts } from './database'
import { ACCOUNT_TYPE, TAccount } from './types'

const app = express()

app.use(express.json())
app.use(cors())

app.listen(3003, () => {
    console.log("Servidor rodando na porta 3003")
})

app.get("/ping", (req: Request, res: Response) => {
    res.send("Pong!")
})

app.get("/accounts", (req: Request, res: Response) => {
    res.send(accounts)
})

app.get("/accounts/:id", (req: Request, res: Response): void => {
    try {
        const id: string = req.params.id

        const result: TAccount | undefined = accounts.find((account) => account.id === id) 

        if (!result) {
            res.statusCode = 404
            throw new Error("Conta não encontrada. Verifique o 'id'.")
        } else {
            res.status(200).send(result)
        }

    } catch (error) {
        res.send(error.message)
    }
    
})

app.delete("/accounts/:id", (req: Request, res: Response): void => {
    try {
        const id: string = req.params.id

        //ou, id[0]!=='a'
        if (!id.startsWith('a')){
            res.statusCode = 400
            throw new Error("'id' inválido. Deve iniciar com a letra 'a'")
        }

        const accountIndex: number = accounts.findIndex((account) => account.id === id)

        if (accountIndex >= 0) {
            accounts.splice(accountIndex, 1)
        }

        res.status(200).send("Item deletado com sucesso")

    } catch (error) {
        console.log(error)
       if(error instanceof Error){
            res.send(error.message)
        } else {
            res.send('Erro inesperado')
        }
    }
})

app.put("/accounts/:id", (req: Request, res: Response): void => {
    try {
    const id: string = req.params.id
    const newId = req.body.id as string | undefined
    const newOwnerName = req.body.ownerName as string | undefined
    const newBalance = req.body.balance as number | undefined
    const newType = req.body.type as ACCOUNT_TYPE | undefined

    if(!newId.startsWith('a')){
        res.statusCode = 400
        throw new Error("'id' deve iniciar com a letra 'a'")
    }

    if(typeof newOwnerName !== 'string' || newOwnerName.length < 2){
        res.statusCode = 400
        throw new Error("'ownerName' deve possuir no mínimo 2 caracteres")
    }

    if(typeof newBalance !== 'number' || newBalance < 0){
        res.statusCode = 404
        throw new Error("newBalance deve ser do tipo 'number'")
    }

    if(newType !== ACCOUNT_TYPE.BLACK && newType !== ACCOUNT_TYPE.PLATINUM && newType !== ACCOUNT_TYPE.GOLD){
        res.statusCode = 404
        throw new Error("newType inválido, deve ser do tipo 'black', 'gold' ou 'platinum'")
    }

    const account: TAccount | undefined = accounts.find((account) => account.id === id) 

    if (account) {
        account.id = newId || account.id
        account.ownerName = newOwnerName || account.ownerName
        account.type = newType || account.type

        account.balance = isNaN(newBalance) ? account.balance : newBalance
    }

    res.status(200).send("Atualização realizada com sucesso")
    } catch (error) {
        console.log(error)
        if(error instanceof Error){
            res.send(error.message)
        }
    }
})