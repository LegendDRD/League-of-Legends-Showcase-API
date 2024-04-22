-- CreateTable
CREATE TABLE `champions` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `key` VARCHAR(50) NOT NULL,
    `name` VARCHAR(50) NOT NULL,
    `title` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `matches` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `match_id` VARCHAR(50) NOT NULL,
    `game_start_timestamp` VARCHAR(50) NOT NULL,
    `game_end_timestamp` VARCHAR(50) NOT NULL,
    `queue_id` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `participants` (
    `Id` INTEGER NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(100) NOT NULL,
    `match_id` VARCHAR(50) NOT NULL,
    `champion_name` VARCHAR(50) NULL,
    `champion_level` VARCHAR(50) NULL,
    `champion_experience` VARCHAR(50) NULL,
    `damage_dealt_to_buildings` VARCHAR(50) NULL,
    `damage_dealt_to_objectives` VARCHAR(50) NULL,
    `damage_dealt_to_turrets` VARCHAR(50) NULL,
    `damage_self_mitigated` VARCHAR(50) NULL,
    `deaths` VARCHAR(50) NULL,
    `double_kills` VARCHAR(50) NULL,
    `dragon_kills` VARCHAR(50) NULL,
    `first_blood_assist` VARCHAR(50) NULL,
    `first_blood_kill` VARCHAR(50) NULL,
    `first_tower_assist` VARCHAR(50) NULL,
    `first_tower_kill` VARCHAR(50) NULL,
    `game_ended_in_surrender` VARCHAR(50) NULL,
    `gold_earned` VARCHAR(50) NULL,
    `gold_spent` VARCHAR(50) NULL,
    `individual_position` VARCHAR(50) NULL,
    `inhibitor_kills` VARCHAR(50) NULL,
    `inhibitor_takedowns` VARCHAR(50) NULL,
    `killing_sprees` VARCHAR(50) NULL,
    `kills` VARCHAR(50) NULL,
    `lane` VARCHAR(50) NULL,
    `largest_critical_strike` VARCHAR(50) NULL,
    `largest_killing_spree` VARCHAR(50) NULL,
    `largest_multikill` VARCHAR(50) NULL,
    `longest_time_spent_living` VARCHAR(50) NULL,
    `magic_damage_dealt` VARCHAR(50) NULL,
    `magic_damage_dealt_to_champions` VARCHAR(50) NULL,
    `magic_damage_taken` VARCHAR(50) NULL,
    `neutral_minions_killed` VARCHAR(50) NULL,
    `penta_kills` VARCHAR(50) NULL,
    `physical_damage_dealt` VARCHAR(50) NULL,
    `physical_damage_dealt_to_champions` VARCHAR(50) NULL,
    `physical_damage_taken` VARCHAR(50) NULL,
    `quadra_kills` VARCHAR(50) NULL,
    `lane_role` VARCHAR(50) NULL,
    `team_position` VARCHAR(50) NULL,
    `total_damage_dealt` VARCHAR(50) NULL,
    `total_damage_dealt_to_champions` VARCHAR(50) NULL,
    `total_damageshielded_on_teammates` VARCHAR(50) NULL,
    `total_damage_taken` VARCHAR(50) NULL,
    `total_heal` VARCHAR(50) NULL,
    `total_heals_on_teammates` VARCHAR(50) NULL,
    `total_minions_killed` VARCHAR(50) NULL,
    `total_time_CC_dealt` VARCHAR(50) NULL,
    `total_units_healed` VARCHAR(50) NULL,
    `triple_kills` VARCHAR(50) NULL,
    `true_damage_dealt` VARCHAR(50) NULL,
    `true_damage_dealt_to_champions` VARCHAR(50) NULL,
    `true_damage_taken` VARCHAR(50) NULL,
    `turret_kills` VARCHAR(50) NULL,
    `turret_takedowns` VARCHAR(50) NULL,
    `turrets_lost` VARCHAR(50) NULL,
    `unreal_kills` VARCHAR(50) NULL,
    `vision_wards_bought_in_game` VARCHAR(50) NULL,
    `wards_killed` VARCHAR(50) NULL,
    `wards_placed` VARCHAR(50) NULL,
    `win` VARCHAR(50) NULL,

    INDEX `FK_participants_matches`(`match_id`),
    INDEX `FK_participants_participants`(`uuid`),
    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(100) NOT NULL,
    `game_name` VARCHAR(50) NULL,
    `tag_line` VARCHAR(50) NULL,
    `discord_id` VARCHAR(50) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
