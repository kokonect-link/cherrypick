import { PrimaryColumn, Entity, Index, Column, ManyToOne, JoinColumn } from 'typeorm';
import { id } from '../id';
import { DriveFile } from './drive-file';
import { User } from './user';

@Entity()
@Index(['name'], { unique: true })
export class EmojiRequest {
	@PrimaryColumn(id())
	public id: string;

	@Column('timestamp with time zone', {
		comment: 'The created date of the EmojiRequest.'
	})
	public createdAt: Date;

	@Index()
	@Column({
		...id(),
		comment: 'The file ID.'
	})
	public fileId: DriveFile['id'];

	@ManyToOne(type => DriveFile, {
		onDelete: 'CASCADE'
	})
	@JoinColumn()
	public file: DriveFile | null;

	@Column('varchar', {
		length: 512, nullable: false,
	})
	public name: string;

	@Column('varchar', {
		array: true, length: 128, default: '{}'
	})
	public aliases: string[];

	@Column('varchar', {
		length: 500, nullable: false,
	})
	public description: string;

	@Index()
	@Column({
		...id(),
		comment: 'The proposer user ID.'
	})
	public proposerId: User['id'];

	@ManyToOne(type => User, {
		onDelete: 'CASCADE'
	})
	@JoinColumn()
	public proposer: User | null;

	@Column('varchar', { length: 8, nullable: false, default: 'pending' })
	public state: 'pending' | 'rejected' | 'accepted';

	@Column('varchar', { length: 500, nullable: true, default: null })
	public moderatorComment: string | null;
}
