import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity("webhooks")
@Unique(["webhookUrl"])
export class Webhook {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "webhook_url", type: "text" })
  webhookUrl!: string;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;
}
