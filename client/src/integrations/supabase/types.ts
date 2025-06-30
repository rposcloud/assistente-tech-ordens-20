export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      categorias_financeiras: {
        Row: {
          ativo: boolean
          created_at: string
          id: string
          nome: string
          tipo: Database["public"]["Enums"]["tipo_entrada_financeira"]
          user_id: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome: string
          tipo: Database["public"]["Enums"]["tipo_entrada_financeira"]
          user_id: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome?: string
          tipo?: Database["public"]["Enums"]["tipo_entrada_financeira"]
          user_id?: string
        }
        Relationships: []
      }
      clientes: {
        Row: {
          bairro: string | null
          cep: string | null
          cidade: string | null
          complemento: string | null
          cpf_cnpj: string
          created_at: string
          data_nascimento: string | null
          email: string | null
          endereco: string | null
          estado: string | null
          id: string
          nome: string
          numero: string | null
          observacoes: string | null
          telefone: string | null
          tipo_documento: Database["public"]["Enums"]["tipo_documento"]
          updated_at: string
          user_id: string
        }
        Insert: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          cpf_cnpj: string
          created_at?: string
          data_nascimento?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          nome: string
          numero?: string | null
          observacoes?: string | null
          telefone?: string | null
          tipo_documento?: Database["public"]["Enums"]["tipo_documento"]
          updated_at?: string
          user_id: string
        }
        Update: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          cpf_cnpj?: string
          created_at?: string
          data_nascimento?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          nome?: string
          numero?: string | null
          observacoes?: string | null
          telefone?: string | null
          tipo_documento?: Database["public"]["Enums"]["tipo_documento"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      entradas_financeiras: {
        Row: {
          categoria: string
          centro_custo: string | null
          conta_bancaria: string | null
          created_at: string
          data_vencimento: string
          descricao: string
          forma_pagamento: Database["public"]["Enums"]["forma_pagamento"]
          id: string
          numero_documento: string | null
          observacoes: string | null
          parcela_atual: number | null
          parcelas: number | null
          pessoa_responsavel: string | null
          status: Database["public"]["Enums"]["status_pagamento"]
          tipo: Database["public"]["Enums"]["tipo_entrada_financeira"]
          updated_at: string
          user_id: string
          valor: number
          valor_parcela: number | null
        }
        Insert: {
          categoria: string
          centro_custo?: string | null
          conta_bancaria?: string | null
          created_at?: string
          data_vencimento: string
          descricao: string
          forma_pagamento: Database["public"]["Enums"]["forma_pagamento"]
          id?: string
          numero_documento?: string | null
          observacoes?: string | null
          parcela_atual?: number | null
          parcelas?: number | null
          pessoa_responsavel?: string | null
          status?: Database["public"]["Enums"]["status_pagamento"]
          tipo: Database["public"]["Enums"]["tipo_entrada_financeira"]
          updated_at?: string
          user_id: string
          valor?: number
          valor_parcela?: number | null
        }
        Update: {
          categoria?: string
          centro_custo?: string | null
          conta_bancaria?: string | null
          created_at?: string
          data_vencimento?: string
          descricao?: string
          forma_pagamento?: Database["public"]["Enums"]["forma_pagamento"]
          id?: string
          numero_documento?: string | null
          observacoes?: string | null
          parcela_atual?: number | null
          parcelas?: number | null
          pessoa_responsavel?: string | null
          status?: Database["public"]["Enums"]["status_pagamento"]
          tipo?: Database["public"]["Enums"]["tipo_entrada_financeira"]
          updated_at?: string
          user_id?: string
          valor?: number
          valor_parcela?: number | null
        }
        Relationships: []
      }
      ordens_servico: {
        Row: {
          acessorios: string | null
          acrescimo: number | null
          aprovado_cliente: boolean | null
          cliente_id: string
          condicoes_equipamento: string | null
          created_at: string
          data_abertura: string
          data_aprovacao: string | null
          data_conclusao: string | null
          data_pagamento: string | null
          data_previsao_entrega: string | null
          data_vencimento: string | null
          defeito_relatado: string
          desconto: number | null
          diagnostico_tecnico: string | null
          finalizada: boolean
          forma_pagamento: Database["public"]["Enums"]["forma_pagamento"] | null
          garantia: number
          historico_status: Json | null
          id: string
          link_expires_at: string | null
          link_token: string | null
          lucro: number | null
          marca: string
          margem_lucro: number | null
          modelo: string
          numero: string
          numero_serie: string | null
          observacoes_internas: string | null
          observacoes_pagamento: string | null
          prazo_entrega: string | null
          prioridade: string | null
          senha_equipamento: string | null
          solucao_aplicada: string | null
          status: Database["public"]["Enums"]["status_ordem"]
          status_pagamento:
            | Database["public"]["Enums"]["status_pagamento"]
            | null
          tecnico_responsavel: string | null
          tipo_equipamento: Database["public"]["Enums"]["tipo_equipamento"]
          updated_at: string
          user_id: string
          valor_final: number | null
          valor_mao_obra: number
          valor_orcamento: number | null
          valor_total: number
        }
        Insert: {
          acessorios?: string | null
          acrescimo?: number | null
          aprovado_cliente?: boolean | null
          cliente_id: string
          condicoes_equipamento?: string | null
          created_at?: string
          data_abertura?: string
          data_aprovacao?: string | null
          data_conclusao?: string | null
          data_pagamento?: string | null
          data_previsao_entrega?: string | null
          data_vencimento?: string | null
          defeito_relatado: string
          desconto?: number | null
          diagnostico_tecnico?: string | null
          finalizada?: boolean
          forma_pagamento?:
            | Database["public"]["Enums"]["forma_pagamento"]
            | null
          garantia?: number
          historico_status?: Json | null
          id?: string
          link_expires_at?: string | null
          link_token?: string | null
          lucro?: number | null
          marca: string
          margem_lucro?: number | null
          modelo: string
          numero: string
          numero_serie?: string | null
          observacoes_internas?: string | null
          observacoes_pagamento?: string | null
          prazo_entrega?: string | null
          prioridade?: string | null
          senha_equipamento?: string | null
          solucao_aplicada?: string | null
          status?: Database["public"]["Enums"]["status_ordem"]
          status_pagamento?:
            | Database["public"]["Enums"]["status_pagamento"]
            | null
          tecnico_responsavel?: string | null
          tipo_equipamento: Database["public"]["Enums"]["tipo_equipamento"]
          updated_at?: string
          user_id: string
          valor_final?: number | null
          valor_mao_obra?: number
          valor_orcamento?: number | null
          valor_total?: number
        }
        Update: {
          acessorios?: string | null
          acrescimo?: number | null
          aprovado_cliente?: boolean | null
          cliente_id?: string
          condicoes_equipamento?: string | null
          created_at?: string
          data_abertura?: string
          data_aprovacao?: string | null
          data_conclusao?: string | null
          data_pagamento?: string | null
          data_previsao_entrega?: string | null
          data_vencimento?: string | null
          defeito_relatado?: string
          desconto?: number | null
          diagnostico_tecnico?: string | null
          finalizada?: boolean
          forma_pagamento?:
            | Database["public"]["Enums"]["forma_pagamento"]
            | null
          garantia?: number
          historico_status?: Json | null
          id?: string
          link_expires_at?: string | null
          link_token?: string | null
          lucro?: number | null
          marca?: string
          margem_lucro?: number | null
          modelo?: string
          numero?: string
          numero_serie?: string | null
          observacoes_internas?: string | null
          observacoes_pagamento?: string | null
          prazo_entrega?: string | null
          prioridade?: string | null
          senha_equipamento?: string | null
          solucao_aplicada?: string | null
          status?: Database["public"]["Enums"]["status_ordem"]
          status_pagamento?:
            | Database["public"]["Enums"]["status_pagamento"]
            | null
          tecnico_responsavel?: string | null
          tipo_equipamento?: Database["public"]["Enums"]["tipo_equipamento"]
          updated_at?: string
          user_id?: string
          valor_final?: number | null
          valor_mao_obra?: number
          valor_orcamento?: number | null
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "ordens_servico_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      ordens_servico_v2: {
        Row: {
          created_at: string | null
          descricao: string | null
          id: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          descricao?: string | null
          id?: never
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          descricao?: string | null
          id?: never
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      pecas_utilizadas: {
        Row: {
          created_at: string
          id: string
          nome: string
          ordem_servico_id: string
          quantidade: number
          valor_total: number
          valor_unitario: number
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
          ordem_servico_id: string
          quantidade?: number
          valor_total?: number
          valor_unitario?: number
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          ordem_servico_id?: string
          quantidade?: number
          valor_total?: number
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "pecas_utilizadas_ordem_servico_id_fkey"
            columns: ["ordem_servico_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
        ]
      }
      produtos: {
        Row: {
          ativo: boolean
          categoria: Database["public"]["Enums"]["categoria_produto"]
          codigo: string | null
          created_at: string
          descricao: string | null
          estoque: number | null
          id: string
          nome: string
          preco_custo: number
          preco_venda: number
          tempo_estimado: number | null
          tipo_equipamento:
            | Database["public"]["Enums"]["tipo_equipamento"]
            | null
          unidade: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ativo?: boolean
          categoria: Database["public"]["Enums"]["categoria_produto"]
          codigo?: string | null
          created_at?: string
          descricao?: string | null
          estoque?: number | null
          id?: string
          nome: string
          preco_custo?: number
          preco_venda?: number
          tempo_estimado?: number | null
          tipo_equipamento?:
            | Database["public"]["Enums"]["tipo_equipamento"]
            | null
          unidade?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ativo?: boolean
          categoria?: Database["public"]["Enums"]["categoria_produto"]
          codigo?: string | null
          created_at?: string
          descricao?: string | null
          estoque?: number | null
          id?: string
          nome?: string
          preco_custo?: number
          preco_venda?: number
          tempo_estimado?: number | null
          tipo_equipamento?:
            | Database["public"]["Enums"]["tipo_equipamento"]
            | null
          unidade?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      produtos_utilizados: {
        Row: {
          created_at: string
          id: string
          ordem_servico_id: string
          produto_id: string
          quantidade: number
          valor_total: number
          valor_unitario: number
        }
        Insert: {
          created_at?: string
          id?: string
          ordem_servico_id: string
          produto_id: string
          quantidade?: number
          valor_total?: number
          valor_unitario?: number
        }
        Update: {
          created_at?: string
          id?: string
          ordem_servico_id?: string
          produto_id?: string
          quantidade?: number
          valor_total?: number
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "produtos_utilizados_ordem_servico_id_fkey"
            columns: ["ordem_servico_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produtos_utilizados_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          bairro: string | null
          cep: string | null
          cidade: string | null
          cnpj: string | null
          complemento: string | null
          created_at: string
          dados_bancarios: string | null
          email_empresa: string | null
          empresa: string | null
          endereco: string | null
          estado: string | null
          id: string
          inscricao_estadual: string | null
          inscricao_municipal: string | null
          logo_url: string | null
          nome_completo: string
          numero: string | null
          observacoes_empresa: string | null
          site: string | null
          telefone: string | null
          updated_at: string
        }
        Insert: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          complemento?: string | null
          created_at?: string
          dados_bancarios?: string | null
          email_empresa?: string | null
          empresa?: string | null
          endereco?: string | null
          estado?: string | null
          id: string
          inscricao_estadual?: string | null
          inscricao_municipal?: string | null
          logo_url?: string | null
          nome_completo: string
          numero?: string | null
          observacoes_empresa?: string | null
          site?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          complemento?: string | null
          created_at?: string
          dados_bancarios?: string | null
          email_empresa?: string | null
          empresa?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          inscricao_estadual?: string | null
          inscricao_municipal?: string | null
          logo_url?: string | null
          nome_completo?: string
          numero?: string | null
          observacoes_empresa?: string | null
          site?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      tipos_defeito: {
        Row: {
          ativo: boolean
          created_at: string
          descricao: string | null
          id: string
          nome: string
          tipo_equipamento: Database["public"]["Enums"]["tipo_equipamento"]
          user_id: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          tipo_equipamento: Database["public"]["Enums"]["tipo_equipamento"]
          user_id: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          tipo_equipamento?: Database["public"]["Enums"]["tipo_equipamento"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      categoria_produto: "peca" | "servico"
      forma_pagamento:
        | "dinheiro"
        | "cartao_credito"
        | "cartao_debito"
        | "pix"
        | "transferencia"
        | "parcelado"
      status_ordem:
        | "aguardando_diagnostico"
        | "aguardando_aprovacao"
        | "aguardando_pecas"
        | "em_reparo"
        | "pronto_entrega"
        | "entregue"
      status_pagamento: "pendente" | "pago" | "parcial" | "cancelado"
      tipo_documento: "cpf" | "cnpj"
      tipo_entrada_financeira: "receita" | "despesa"
      tipo_equipamento:
        | "smartphone"
        | "notebook"
        | "desktop"
        | "tablet"
        | "outros"
        | "todos"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      categoria_produto: ["peca", "servico"],
      forma_pagamento: [
        "dinheiro",
        "cartao_credito",
        "cartao_debito",
        "pix",
        "transferencia",
        "parcelado",
      ],
      status_ordem: [
        "aguardando_diagnostico",
        "aguardando_aprovacao",
        "aguardando_pecas",
        "em_reparo",
        "pronto_entrega",
        "entregue",
      ],
      status_pagamento: ["pendente", "pago", "parcial", "cancelado"],
      tipo_documento: ["cpf", "cnpj"],
      tipo_entrada_financeira: ["receita", "despesa"],
      tipo_equipamento: [
        "smartphone",
        "notebook",
        "desktop",
        "tablet",
        "outros",
        "todos",
      ],
    },
  },
} as const
