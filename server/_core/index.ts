import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { garantirAdminPadrao } from "../configuracoesDb";
import { getDb } from "../db";
import { sql } from "drizzle-orm";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => { server.close(() => resolve(true)); });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) return port;
  }
  throw new Error(`No available port from ${startPort}`);
}

async function startServer() {
  await garantirAdminPadrao().catch(err => {
    console.warn("[Boot] Admin padrão:", err?.message || err);
  });

  const db = await getDb();
  if (db) {
    const migrations = [
      sql`CREATE TABLE IF NOT EXISTS app_users (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(320) NOT NULL UNIQUE,
        senha_hash TEXT NOT NULL,
        role VARCHAR(20) DEFAULT 'arquiteto' NOT NULL,
        ativo BOOLEAN DEFAULT TRUE NOT NULL,
        avatar TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )`,
      sql`CREATE TABLE IF NOT EXISTS app_sessions (
        id SERIAL PRIMARY KEY,
        token VARCHAR(128) NOT NULL UNIQUE,
        user_id INTEGER NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )`,
      sql`CREATE TABLE IF NOT EXISTS app_permissoes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        modulo VARCHAR(64) NOT NULL,
        pode_ver BOOLEAN DEFAULT FALSE NOT NULL,
        pode_criar BOOLEAN DEFAULT FALSE NOT NULL,
        pode_editar BOOLEAN DEFAULT FALSE NOT NULL,
        pode_deletar BOOLEAN DEFAULT FALSE NOT NULL,
        UNIQUE(user_id, modulo)
      )`,
      sql`CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(320),
        telefone VARCHAR(30),
        origem VARCHAR(50) DEFAULT 'instagram' NOT NULL,
        status VARCHAR(50) DEFAULT 'novo' NOT NULL,
        tipo_imovel VARCHAR(100),
        cidade VARCHAR(100),
        orcamento_estimado DECIMAL(15,2),
        tags TEXT,
        observacoes TEXT,
        motivo_perda TEXT,
        score INTEGER DEFAULT 0,
        responsavel_id INTEGER,
        proximo_follow_up DATE,
        convertido_cliente_id INTEGER,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )`,
      sql`CREATE TABLE IF NOT EXISTS clientes (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(320),
        telefone VARCHAR(30),
        cpf_cnpj VARCHAR(20),
        endereco TEXT,
        cidade VARCHAR(100),
        estado VARCHAR(2),
        cep VARCHAR(10),
        data_nascimento DATE,
        instagram VARCHAR(100),
        observacoes TEXT,
        lead_id INTEGER,
        portal_ativo BOOLEAN DEFAULT FALSE NOT NULL,
        portal_senha_hash TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )`,
      sql`CREATE TABLE IF NOT EXISTS briefings (
        id SERIAL PRIMARY KEY,
        cliente_id INTEGER NOT NULL,
        projeto_id INTEGER,
        tipo_imovel VARCHAR(100),
        metragem DECIMAL(8,2),
        ambientes TEXT,
        estilo VARCHAR(100),
        referencias TEXT,
        orcamento_estimado DECIMAL(15,2),
        prazo_desejado DATE,
        prioridades TEXT,
        restricoes TEXT,
        moradores TEXT,
        animais BOOLEAN DEFAULT FALSE,
        criancas BOOLEAN DEFAULT FALSE,
        observacoes TEXT,
        resumo_ia TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )`,
      sql`CREATE TABLE IF NOT EXISTS projetos (
        id SERIAL PRIMARY KEY,
        codigo VARCHAR(20),
        nome VARCHAR(255) NOT NULL,
        cliente_id INTEGER NOT NULL,
        responsavel_id INTEGER,
        status VARCHAR(50) DEFAULT 'briefing' NOT NULL,
        tipo_imovel VARCHAR(100),
        endereco TEXT,
        metragem DECIMAL(8,2),
        ambientes TEXT,
        descricao TEXT,
        data_inicio DATE,
        data_previsao DATE,
        data_conclusao DATE,
        valor_contrato DECIMAL(15,2),
        briefing_id INTEGER,
        contrato_id INTEGER,
        observacoes_internas TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )`,
      sql`CREATE TABLE IF NOT EXISTS etapas_projeto (
        id SERIAL PRIMARY KEY,
        projeto_id INTEGER NOT NULL,
        nome VARCHAR(255) NOT NULL,
        descricao TEXT,
        ordem INTEGER DEFAULT 0 NOT NULL,
        status VARCHAR(50) DEFAULT 'pendente' NOT NULL,
        data_inicio DATE,
        data_previsao DATE,
        data_conclusao DATE,
        aprovado_cliente BOOLEAN DEFAULT FALSE NOT NULL,
        data_aprovacao TIMESTAMP,
        observacoes TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )`,
      sql`CREATE TABLE IF NOT EXISTS tarefas (
        id SERIAL PRIMARY KEY,
        projeto_id INTEGER,
        etapa_id INTEGER,
        titulo VARCHAR(255) NOT NULL,
        descricao TEXT,
        responsavel_id INTEGER,
        status VARCHAR(50) DEFAULT 'a_fazer' NOT NULL,
        prioridade VARCHAR(20) DEFAULT 'media' NOT NULL,
        data_vencimento DATE,
        data_conclusao TIMESTAMP,
        checklist TEXT,
        tags TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )`,
      sql`CREATE TABLE IF NOT EXISTS propostas (
        id SERIAL PRIMARY KEY,
        numero VARCHAR(30),
        cliente_id INTEGER NOT NULL,
        lead_id INTEGER,
        titulo VARCHAR(255) NOT NULL,
        tipo_servico VARCHAR(100),
        descricao TEXT,
        escopo TEXT,
        escopo_excluido TEXT,
        num_revisoes INTEGER DEFAULT 2,
        prazo_entrega VARCHAR(100),
        validade_proposta DATE,
        valor_total DECIMAL(15,2) NOT NULL,
        forma_pagamento TEXT,
        status VARCHAR(50) DEFAULT 'rascunho' NOT NULL,
        link_publico VARCHAR(128),
        data_envio TIMESTAMP,
        data_visualizacao TIMESTAMP,
        data_aceite TIMESTAMP,
        motivo_recusa TEXT,
        observacoes TEXT,
        responsavel_id INTEGER,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )`,
      sql`CREATE TABLE IF NOT EXISTS itens_propostas (
        id SERIAL PRIMARY KEY,
        proposta_id INTEGER NOT NULL,
        descricao VARCHAR(255) NOT NULL,
        unidade VARCHAR(30),
        quantidade DECIMAL(10,2) DEFAULT 1,
        valor_unitario DECIMAL(15,2) NOT NULL,
        valor_total DECIMAL(15,2) NOT NULL,
        ordem INTEGER DEFAULT 0
      )`,
      sql`CREATE TABLE IF NOT EXISTS contratos (
        id SERIAL PRIMARY KEY,
        numero VARCHAR(30),
        projeto_id INTEGER,
        proposta_id INTEGER,
        cliente_id INTEGER NOT NULL,
        titulo VARCHAR(255) NOT NULL,
        conteudo TEXT,
        valor_total DECIMAL(15,2) NOT NULL,
        forma_pagamento TEXT,
        status VARCHAR(50) DEFAULT 'aguardando_assinatura' NOT NULL,
        data_assinatura DATE,
        data_inicio DATE,
        data_previsao_termino DATE,
        assinatura_cliente_url TEXT,
        observacoes TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )`,
      sql`CREATE TABLE IF NOT EXISTS financeiro_lancamentos (
        id SERIAL PRIMARY KEY,
        projeto_id INTEGER,
        cliente_id INTEGER,
        fornecedor_id INTEGER,
        descricao VARCHAR(255) NOT NULL,
        tipo VARCHAR(20) NOT NULL,
        categoria VARCHAR(100),
        valor DECIMAL(15,2) NOT NULL,
        valor_pago DECIMAL(15,2),
        data_vencimento DATE NOT NULL,
        data_pagamento DATE,
        status VARCHAR(30) DEFAULT 'pendente' NOT NULL,
        forma_pagamento VARCHAR(50),
        parcela INTEGER,
        total_parcelas INTEGER,
        recorrente BOOLEAN DEFAULT FALSE,
        comprovante TEXT,
        observacoes TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )`,
      sql`CREATE TABLE IF NOT EXISTS fornecedores (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        categoria VARCHAR(100) NOT NULL,
        contato VARCHAR(255),
        telefone VARCHAR(30),
        email VARCHAR(320),
        website VARCHAR(255),
        cnpj VARCHAR(20),
        endereco TEXT,
        prazo_medio INTEGER,
        avaliacao INTEGER DEFAULT 5,
        observacoes TEXT,
        ativo BOOLEAN DEFAULT TRUE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )`,
      sql`CREATE TABLE IF NOT EXISTS compras (
        id SERIAL PRIMARY KEY,
        projeto_id INTEGER NOT NULL,
        fornecedor_id INTEGER,
        descricao VARCHAR(255) NOT NULL,
        categoria VARCHAR(100),
        ambiente VARCHAR(100),
        quantidade DECIMAL(10,2) DEFAULT 1,
        unidade VARCHAR(30),
        valor_unitario_orcado DECIMAL(15,2),
        valor_total_orcado DECIMAL(15,2),
        valor_pago DECIMAL(15,2),
        status VARCHAR(50) DEFAULT 'orcado' NOT NULL,
        data_pedido DATE,
        data_entrega_prevista DATE,
        data_entrega_real DATE,
        link_produto TEXT,
        codigo_sku VARCHAR(100),
        foto_produto TEXT,
        nota_fiscal TEXT,
        observacoes TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )`,
      sql`CREATE TABLE IF NOT EXISTS memoriais (
        id SERIAL PRIMARY KEY,
        projeto_id INTEGER NOT NULL,
        titulo VARCHAR(255) NOT NULL,
        descricao TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )`,
      sql`CREATE TABLE IF NOT EXISTS itens_memorial (
        id SERIAL PRIMARY KEY,
        memorial_id INTEGER NOT NULL,
        ambiente VARCHAR(100) NOT NULL,
        categoria VARCHAR(100) NOT NULL,
        descricao VARCHAR(255) NOT NULL,
        especificacao TEXT,
        fornecedor_sugerido VARCHAR(255),
        codigo_sku VARCHAR(100),
        preco_estimado DECIMAL(15,2),
        link_compra TEXT,
        foto_referencia TEXT,
        alternativa_economica TEXT,
        alternativa_premium TEXT,
        ordem INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )`,
      sql`CREATE TABLE IF NOT EXISTS arquivos (
        id SERIAL PRIMARY KEY,
        projeto_id INTEGER,
        cliente_id INTEGER,
        etapa_id INTEGER,
        nome VARCHAR(255) NOT NULL,
        nome_original VARCHAR(255) NOT NULL,
        tipo VARCHAR(50),
        tamanho INTEGER,
        url TEXT NOT NULL,
        categoria VARCHAR(100),
        versao INTEGER DEFAULT 1,
        aprovado BOOLEAN DEFAULT FALSE,
        visivel_cliente BOOLEAN DEFAULT FALSE,
        comentario TEXT,
        upload_por_id INTEGER,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )`,
      sql`CREATE TABLE IF NOT EXISTS cronograma (
        id SERIAL PRIMARY KEY,
        projeto_id INTEGER NOT NULL,
        titulo VARCHAR(255) NOT NULL,
        descricao TEXT,
        responsavel VARCHAR(255),
        data_inicio DATE NOT NULL,
        data_fim DATE NOT NULL,
        data_inicio_real DATE,
        data_fim_real DATE,
        depende_de INTEGER,
        status VARCHAR(50) DEFAULT 'pendente' NOT NULL,
        cor VARCHAR(20) DEFAULT '#c9a96e',
        ordem INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )`,
      sql`CREATE TABLE IF NOT EXISTS comentarios (
        id SERIAL PRIMARY KEY,
        projeto_id INTEGER NOT NULL,
        etapa_id INTEGER,
        tarefa_id INTEGER,
        autor_id INTEGER,
        autor_nome VARCHAR(255),
        texto TEXT NOT NULL,
        visivel_cliente BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )`,
      sql`CREATE TABLE IF NOT EXISTS notificacoes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        titulo VARCHAR(255) NOT NULL,
        mensagem TEXT NOT NULL,
        tipo VARCHAR(50) DEFAULT 'info',
        lida BOOLEAN DEFAULT FALSE NOT NULL,
        link VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )`,
      sql`CREATE TABLE IF NOT EXISTS templates (
        id SERIAL PRIMARY KEY,
        tipo VARCHAR(50) NOT NULL,
        nome VARCHAR(255) NOT NULL,
        descricao TEXT,
        conteudo TEXT NOT NULL,
        ativo BOOLEAN DEFAULT TRUE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )`,
    ];

    for (const m of migrations) {
      try {
        await db.execute(m);
      } catch (e: any) {
        console.warn("[Boot] Migração:", e?.message?.slice(0, 80));
      }
    }
  }

  const app = express();
  const server = createServer(app);

  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: false }));

  app.use("/api/trpc", createExpressMiddleware({ router: appRouter, createContext }));

  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = process.env.PORT ? parseInt(process.env.PORT) : await findAvailablePort(3000);
  server.listen(port, () => {
    console.log(`[BARU] Server on port ${port}`);
  });
}

startServer().catch(console.error);
