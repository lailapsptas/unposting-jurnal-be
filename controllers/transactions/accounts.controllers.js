import { AccountsService } from "../../services/transactions/accounts.services.js";

export class AccountsControllers {
  static accountsService = new AccountsService();

  static async create(req, res) {
    try {
      const account = await AccountsControllers.accountsService.create(
        req.body
      );
      res.status(201).json(account);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async findAll(req, res) {
    try {
      const accounts = await AccountsControllers.accountsService.findAll();
      res.status(200).json(accounts);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async findById(req, res) {
    try {
      const account = await AccountsControllers.accountsService.findById(
        req.params.id
      );
      if (!account) {
        return res.status(404).json({ message: "Account not found" });
      }
      res.status(200).json(account);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async update(req, res) {
    try {
      const account = await AccountsControllers.accountsService.update(
        req.params.id,
        req.body
      );
      res.status(200).json(account);
    } catch (error) {
      if (error.message === "Account not found") {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const response = await AccountsControllers.accountsService.delete(
        req.params.id
      );
      res.status(200).json(response);
    } catch (error) {
      if (error.message === "Account not found") {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: error.message });
    }
  }
}
