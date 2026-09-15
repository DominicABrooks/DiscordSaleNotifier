import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("sales")
export class Sale {
  @PrimaryColumn({ name: "game_id", type: "varchar", length: 255 })
  gameId!: string;

  @Column({ name: "expiration_date", type: "timestamp", nullable: true })
  expirationDate!: Date | null;
}
