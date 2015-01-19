use NutriationDB

CREATE TABLE [dbo].[Parameters] (
    [Id]           INT            IDENTITY (1, 1) NOT NULL,
    [Name]         NVARCHAR (MAX) NOT NULL,
    [Measure_Unit] NVARCHAR (MAX) DEFAULT ('Unit') NOT NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
);



CREATE TABLE [dbo].[ParameterValues] (
    [Id]           INT            IDENTITY (1, 1) NOT NULL,
    [Parameter_Id] INT            NOT NULL,
    [Value]        FLOAT (53)     NOT NULL,
    [DateTime]     DATETIME       DEFAULT (getdate()) NOT NULL,
    [Comment]      NVARCHAR (MAX) NULL,
	PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK] FOREIGN KEY ([Parameter_Id]) REFERENCES [dbo].[Parameters] ([Id]) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE [dbo].[MeasureUnit]
(
	[Id] INT NOT NULL PRIMARY KEY, 
    [MeasureUnit] NVARCHAR(20) NOT NULL
)

CREATE TABLE [dbo].[Product] (
    [Id]            INT          NOT NULL,
    [Name]          VARCHAR (50) NOT NULL,
    [Calories]      FLOAT (53)   NOT NULL,
    [Protein]       FLOAT (53)   NOT NULL,
    [Fat]           FLOAT (53)   NOT NULL,
    [Carbohydrates] FLOAT (53)   NOT NULL,
    [MeasureUnitId] INT          NOT NULL,
    [UserId]        INT          NOT NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Product_Measure] FOREIGN KEY ([MeasureUnitId]) REFERENCES [dbo].[MeasureUnit] ([Id]) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT [FK_Product_User] FOREIGN KEY ([UserId]) REFERENCES [dbo].[UserProfile] ([UserId]) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE [dbo].[Meal] (
    [Id]        INT        NOT NULL,
    [UserId]    INT        NOT NULL,
    [Date]      DATETIME   NOT NULL,
    [Weight]    FLOAT (53) NOT NULL,
    [ProductId] INT        NOT NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Meal_Product] FOREIGN KEY ([ProductId]) REFERENCES [dbo].[Product] ([Id]),
    CONSTRAINT [FK_Meal_User] FOREIGN KEY ([UserId]) REFERENCES [dbo].[UserProfile] ([UserId])
);
