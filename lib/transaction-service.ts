import { db } from "@/lib/db";
import { TransactionType, TransactionStatus, PaymentProvider } from "@prisma/client";

export const createTransaction = async (data: {
  userId: string;
  type: TransactionType;
  amount: number;
  solcitosAmount: number;
  bonusAmount?: number;
  provider: PaymentProvider;
  providerId?: string;
  description?: string;
  metadata?: any;
}) => {
  return await db.transaction.create({
    data: {
      userId: data.userId,
      type: data.type,
      status: TransactionStatus.PENDING,
      amount: data.amount,
      solcitosAmount: data.solcitosAmount,
      bonusAmount: data.bonusAmount || 0,
      provider: data.provider,
      providerId: data.providerId,
      description: data.description,
      metadata: data.metadata,
    },
  });
};

export const completeTransaction = async (
  transactionId: string,
  providerId?: string
) => {
  const transaction = await db.transaction.findUnique({
    where: { id: transactionId },
  });

  if (!transaction) {
    throw new Error("Transacción no encontrada");
  }

  if (transaction.status === TransactionStatus.COMPLETED) {
    throw new Error("Transacción ya completada");
  }

  const totalSolcitos = transaction.solcitosAmount + transaction.bonusAmount;

  const [updatedTransaction] = await db.$transaction([
    db.transaction.update({
      where: { id: transactionId },
      data: {
        status: TransactionStatus.COMPLETED,
        processedAt: new Date(),
        providerId: providerId || transaction.providerId,
      },
    }),
    db.user.update({
      where: { id: transaction.userId },
      data: {
        solcitosBalance: { increment: totalSolcitos },
        totalSolcitosEarned: { increment: totalSolcitos },
      },
    }),
  ]);

  return updatedTransaction;
};

export const failTransaction = async (transactionId: string, reason: string) => {
  return await db.transaction.update({
    where: { id: transactionId },
    data: {
      status: TransactionStatus.FAILED,
      failureReason: reason,
      processedAt: new Date(),
    },
  });
};

export const getUserTransactions = async (userId: string, limit = 20) => {
  return await db.transaction.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
};

export const getTransactionByProviderId = async (
  providerId: string,
  provider: PaymentProvider
) => {
  return await db.transaction.findFirst({
    where: { providerId, provider },
  });
};