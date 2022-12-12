import moment from "moment";
export const generateCollectionID = (mobilenumber: string) => {
  const date = new Date();
  let formattedDate = moment(date).format("YYYY-MM-DD HH:mm");
  formattedDate = formattedDate + " " + "MSISDN" + " " + mobilenumber;
  const clean = formattedDate.replace(/[^A-Z0-9]+/ig, "_");
  return clean;
};
