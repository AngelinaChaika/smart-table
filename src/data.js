import { checkResponse } from "./lib/utils.js";

const BASE_URL = "https://webinars.webdev.education-services.ru/sp7-api";

export function initData(sourceData) {
  let sellers;
  let customers;
  let lastResult;
  let lastQuery;

  const mapRecords = (data) =>
    data.map((item) => ({
      id: item.receipt_id,
      date: item.date,
      seller: sellers[item.seller_id],
      customer: customers[item.customer_id],
      total: item.total_amount,
    }));

  const getIndexes = async () => {
    if (!sellers || !customers) {
      try {
        [sellers, customers] = await Promise.all([
          fetch(`${BASE_URL}/sellers`).then(checkResponse),
          fetch(`${BASE_URL}/customers`).then(checkResponse),
        ]);
      } catch (error) {
        console.log("Ошибка в getIndexes:", error);
        throw error;
      }
    }

    return { sellers, customers };
  };

  const getRecords = async (query, isUpdated = false) => {
    const qs = new URLSearchParams(query);
    const nextQuery = qs.toString();

    if (lastQuery === nextQuery && !isUpdated) {
      return lastResult;
    }

    const records = await fetch(`${BASE_URL}/records?${nextQuery}`).then(
      checkResponse,
    );

    lastQuery = nextQuery;
    lastResult = {
      total: records.total,
      items: mapRecords(records.items),
    };

    return lastResult;
  };

  return {
    getIndexes,
    getRecords,
  };
}
