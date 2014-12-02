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
